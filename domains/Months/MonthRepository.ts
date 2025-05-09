import { PrismaClient, Prisma } from '@prisma/client';
import { IMonthRepository } from './IMonthRepository';
import { Month } from './Month';
import { MonthMapper } from './MonthMapper';
import { RedisClient } from '@/infrastructure/redis';

// Define types for raw query results
interface CategorySpending {
  categoryId: number;
  categoryName: string;
  totalAmountCAD: string;
  totalAmountUSD: string;
}

interface TotalResult {
  total: string | number;
}

export class MonthRepository implements IMonthRepository {
  constructor(private prisma: PrismaClient, private redis: RedisClient) {}

  async index(): Promise<{data: Month[], pagination: any}> {
    const cacheKey = 'months:all';
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log('Cache hit for months');
        const parsed = JSON.parse(cachedData);
        return {
          data: parsed.months.map(MonthMapper.toDomain),
          pagination: parsed.pagination
        };
      }
    } catch (error) {
      console.error('Redis cache error, falling back to database:', error);
    }
    
    // Get count for pagination
    const totalCount = await this.prisma.month.count();

    // Execute query with pagination and filtering
    const months = await this.prisma.month.findMany({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ],
    });
    
    const result = {
      data: months.map(MonthMapper.toDomain),
      pagination: {
        total: totalCount,
      }
    };
    
    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify({
        months,
        pagination: { total: totalCount }
      }), { EX: 3600 }); // Cache for 1 hour
    } catch (error) {
      console.warn('Redis cache set error, but data was retrieved successfully:', error);
    }

    return result;
  }

  async show(id: number): Promise<Month | null> {
    const cacheKey = `month:${id}`;
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for month ${id}`);
        return MonthMapper.toDomain(JSON.parse(cachedData));
      }
    } catch (error) {
      console.error('Redis cache error, falling back to database:', error);
    }
    
    const month = await this.prisma.month.findUnique({
      where: { id }
    });

    if (!month) return null;
    
    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify(month), { EX: 3600 }); // Cache for 1 hour
    } catch (error) {
      console.warn('Redis cache set error, but data was retrieved successfully:', error);
    }
    
    return MonthMapper.toDomain(month);
  }

  async findByDate(month: number, year: number): Promise<Month | null> {
    const cacheKey = `month:date:${month}:${year}`;
    console.log(cacheKey);
    
    
    // // Try to get from cache first
    // try {
    //   const cachedData = await this.redis.get(cacheKey);
    //   if (cachedData) {
    //     console.log(`Cache hit for month ${month}/${year}`);
    //     if (cachedData === 'null') return null; // Handle null case
    //     return MonthMapper.toDomain(JSON.parse(cachedData));
    //   }
    // } catch (error) {
    //   console.error('Redis cache error, falling back to database:', error);
    // }
    
    const result = await this.prisma.month.findFirst({
      where: { month, year }
    });

    console.log(result);
    

    // Store in cache (even if null)
    try {
      await this.redis.set(
        cacheKey, 
        result ? JSON.stringify(result) : 'null',
        { EX: 3600 }
      ); // Cache for 1 hour
    } catch (error) {
      console.warn('Redis cache set error, but data was retrieved successfully:', error);
    }
    
    if (!result) return null;
    return MonthMapper.toDomain(result);
  }

  async store(monthData: Omit<Month, 'id' | 'createdAt' | 'totalIncome' | 'totalExpenses' | 'recurringExpenses'>): Promise<Month> {
    const prismaData = MonthMapper.toPersistence(monthData);

    const created = await this.prisma.month.create({
      data: prismaData
    });
    
    // Invalidate relevant caches
    try {
      await this.redis.del('months:all');
      await this.redis.del(`month:date:${created.month}:${created.year}`);
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }

    return MonthMapper.toDomain(created);
  }

  async update(id: number, data: Partial<Month>): Promise<Month> {
    const updateData: Prisma.MonthUpdateInput = {};

    if (data.month !== undefined) updateData.month = data.month;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.notes !== undefined) updateData.notes = data.notes;
    // We don't manually update recurring expenses as it's handled by database triggers

    const updated = await this.prisma.month.update({
      where: { id },
      data: updateData
    });
    
    // Invalidate relevant caches
    try {
      await this.redis.del(`month:${id}`);
      await this.redis.del('months:all');
      await this.redis.del(`month:date:${updated.month}:${updated.year}`);
      
      // If month/year was changed, also invalidate old month/year cache
      if (data.month !== undefined || data.year !== undefined) {
        const oldMonth = await this.show(id);
        if (oldMonth) {
          await this.redis.del(`month:date:${oldMonth.month}:${oldMonth.year}`);
        }
      }
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }

    return MonthMapper.toDomain(updated);
  }

  async destroy(id: number): Promise<void> {
    // Get month before deleting to invalidate date-based cache
    const month = await this.prisma.month.findUnique({
      where: { id },
      select: { month: true, year: true }
    });
    
    await this.prisma.month.delete({
      where: { id }
    });
    
    // Invalidate relevant caches
    try {
      await this.redis.del(`month:${id}`);
      await this.redis.del('months:all');
      if (month) {
        await this.redis.del(`month:date:${month.month}:${month.year}`);
      }
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
  }

  async findByMonthAndYear(month: number, year: number): Promise<boolean> {
    const cacheKey = `month:exists:${month}:${year}`;
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData !== null) {
        console.log(`Cache hit for month exists check ${month}/${year}`);
        return cachedData === 'true';
      }
    } catch (error) {
      console.error('Redis cache error, falling back to database:', error);
    }
    
    const count = await this.prisma.month.count({
      where: {
        month,
        year
      }
    });
    
    const exists = count > 0;
    
    // Store in cache
    try {
      await this.redis.set(cacheKey, exists ? 'true' : 'false', { EX: 1800 }); // Cache for 30 minutes
    } catch (error) {
      console.warn('Redis cache set error, but data was retrieved successfully:', error);
    }
    
    return exists;
  }

  async hasTransactions(id: number): Promise<{hasTransactions: boolean, count: number}> {
    const cacheKey = `month:${id}:transactions`;
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for month ${id} transactions check`);
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Redis cache error, falling back to database:', error);
    }
    
    const month = await this.prisma.month.findUnique({
      where: { id },
      include: {
        transactions: {
          select: { id: true }
        }
      }
    });
    
    if (!month) {
      return { hasTransactions: false, count: 0 };
    }
    
    const result = {
      hasTransactions: month.transactions.length > 0,
      count: month.transactions.length
    };
    
    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify(result), { EX: 1800 }); // Cache for 30 minutes
    } catch (error) {
      console.warn('Redis cache set error, but data was retrieved successfully:', error);
    }
    
    return result;
  }

  async getMonthDetails(id: number): Promise<{ month: Month | null, spendingByCategory: CategorySpending[] }> {
    const cacheKey = `month:${id}:details`;
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for month ${id} details`);
        const data = JSON.parse(cachedData);
        return {
          month: data.month ? MonthMapper.toDomain(data.month) : null,
          spendingByCategory: data.spendingByCategory as CategorySpending[]
        };
      }
    } catch (error) {
      console.error('Redis cache error, falling back to database:', error);
    }
    
    // Step 1: Get the month data
    const month = await this.prisma.month.findUnique({
      where: { id }
    });
    
    if (!month) {
      return { month: null, spendingByCategory: [] };
    }
    
    // Step 2: Get spending by category
    const spendingByCategory = await this.prisma.$queryRaw<CategorySpending[]>`
      SELECT 
        c.id AS "categoryId",
        c.name AS "categoryName",
        CONCAT('$', CAST(SUM(t.amount_cad) AS TEXT)) AS "totalAmountCAD",
        CONCAT('$', CAST(SUM(t.amount_usd) AS TEXT)) AS "totalAmountUSD"
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.month_id = ${id} AND t.type = 'Expense'
      GROUP BY c.id, c.name
      ORDER BY SUM(t.amount_cad) DESC
    `;
    
    const result = {
      month: MonthMapper.toDomain(month),
      spendingByCategory
    };
    
    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify({
        month,
        spendingByCategory
      }), { EX: 1800 }); // Cache for 30 minutes
    } catch (error) {
      console.warn('Redis cache set error, but data was retrieved successfully:', error);
    }
    
    return result;
  }

  async updateTotals(monthId: number): Promise<void> {
    const month = await this.prisma.month.findUnique({
      where: { id: monthId }
    });

    if (!month) return;

    // Calculate total income
    const incomeResult = await this.prisma.$queryRaw<TotalResult[]>`
      SELECT COALESCE(SUM(amount_cad), 0) AS total
      FROM transactions
      WHERE month_id = ${monthId} AND type = 'Income'
    `;
    const totalIncome = Number(incomeResult[0].total);

    // Calculate total expenses
    const expensesResult = await this.prisma.$queryRaw<TotalResult[]>`
      SELECT COALESCE(SUM(amount_cad), 0) AS total
      FROM transactions
      WHERE month_id = ${monthId} AND type = 'Expense'
    `;
    const totalExpenses = Number(expensesResult[0].total);

    // Calculate recurring expenses (from transactions in categories marked as recurring)
    const recurringExpensesResult = await this.prisma.$queryRaw<TotalResult[]>`
      SELECT COALESCE(SUM(t.amount_cad), 0) AS total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.month_id = ${monthId} AND t.type = 'Expense' AND c.is_recurring = true
    `;
    const recurringExpenses = Number(recurringExpensesResult[0].total);

    // Calculate transaction count
    const transactionCount = await this.prisma.transaction.count({
      where: { monthId }
    });

    // Update the month record
    await this.prisma.month.update({
      where: { id: monthId },
      data: {
        totalIncome,
        totalExpenses,
        recurringExpenses,
        transactionCount
      }
    });

    // Invalidate caches
    try {
      await this.redis.del(`month:${monthId}`);
      await this.redis.del(`month:${monthId}:details`);
      await this.redis.del('months:all');
      await this.redis.del(`month:date:${month.month}:${month.year}`);
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
  }

  /**
   * Recalculate recurring expenses for all months or a specific month
   * This is useful after changing which categories are considered recurring
   * or after importing data
   */
  async recalculateRecurringExpenses(monthId?: number): Promise<void> {
    try {
      if (monthId) {
        // Recalculate for a specific month
        const month = await this.prisma.month.findUnique({
          where: { id: monthId }
        });

        if (!month) return;

        // Calculate recurring expenses for this month
        const recurringExpensesResult = await this.prisma.$queryRaw<TotalResult[]>`
          SELECT COALESCE(SUM(t.amount_cad), 0) AS total
          FROM transactions t
          JOIN categories c ON t.category_id = c.id
          WHERE t.month_id = ${monthId} AND t.type = 'Expense' AND c.is_recurring = true
        `;
        const recurringExpenses = Number(recurringExpensesResult[0].total);

        // Update the month record
        await this.prisma.month.update({
          where: { id: monthId },
          data: { recurringExpenses }
        });

        // Invalidate caches for this month
        await this.redis.del(`month:${monthId}`);
        await this.redis.del(`month:${monthId}:details`);
        await this.redis.del(`month:date:${month.month}:${month.year}`);
      } else {
        // Recalculate for all months
        await this.prisma.$executeRaw`
          UPDATE months m
          SET recurring_expenses = (
              SELECT COALESCE(SUM(t.amount_cad), 0)
              FROM transactions t
              JOIN categories c ON t.category_id = c.id
              WHERE t.month_id = m.id
              AND c.is_recurring = true
              AND t.type = 'Expense'
          )
        `;

        // Invalidate all month-related caches
        await this.redis.del('months:all');
        
        // Invalidate month detail caches by prefixes
        await this.invalidateMonthCaches();
      }

      console.log(`Successfully recalculated recurring expenses for ${monthId ? `month ${monthId}` : 'all months'}`);
    } catch (error) {
      console.error('Error recalculating recurring expenses:', error);
      throw error;
    }
  }

  // Helper method to invalidate month-related caches
  private async invalidateMonthCaches(): Promise<void> {
    try {
      // Since we don't have a keys method, we'll use specific patterns
      // that we know are used in our caching strategy
      
      // Get all months
      const months = await this.prisma.month.findMany({
        select: { id: true, month: true, year: true }
      });

      // Delete specific caches for each month
      for (const month of months) {
        await this.redis.del(`month:${month.id}`);
        await this.redis.del(`month:${month.id}:details`);
        await this.redis.del(`month:${month.id}:transactions`);
        await this.redis.del(`month:date:${month.month}:${month.year}`);
        await this.redis.del(`month:exists:${month.month}:${month.year}`);
      }
    } catch (error) {
      console.error('Error invalidating month caches:', error);
    }
  }
} 