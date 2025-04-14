import { PrismaClient, Prisma } from '@prisma/client';
import { IMonthRepository } from './IMonthRepository';
import { Month } from './Month';
import { MonthMapper } from './MonthMapper';
import { RedisClient } from '@/lib/redis';

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
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for month ${month}/${year}`);
        if (cachedData === 'null') return null; // Handle null case
        return MonthMapper.toDomain(JSON.parse(cachedData));
      }
    } catch (error) {
      console.error('Redis cache error, falling back to database:', error);
    }
    
    const result = await this.prisma.month.findFirst({
      where: { month, year }
    });

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

  async store(monthData: Omit<Month, 'id' | 'createdAt' | 'totalIncome' | 'totalExpenses'>): Promise<Month> {
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

    const transactionCount = month.transactions.length;

    const result = {
      hasTransactions: transactionCount > 0,
      count: transactionCount
    };
    
    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify(result), { EX: 1800 }); // Cache for 30 minutes
    } catch (error) {
      console.warn('Redis cache set error, but data was retrieved successfully:', error);
    }

    return result;
  }
} 