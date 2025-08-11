import { PrismaClient, Prisma } from '@prisma/client';
import { RedisClient } from '@/infrastructure/redis';
import { ITransactionRepository } from './ITransactionRepository';
import { CoreTransaction } from '../Validators/types';
import { TransactionCreateDTO } from '../DTOs/TransactionDTO';
import { TransactionImportDTO, TransactionImportResultDTO } from '../DTOs/TransactionImportDTO';
import { CategorySpendingDTO } from '../DTOs/TransactionDTO';
import { USDSpending } from '@/app/types';
import { TransactionType } from '../Entities/Transaction';
import { TransactionMapper } from '../Adapters/TransactionMapper';

export class TransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaClient, private redis: RedisClient) {}

  async index(monthId?: number): Promise<any[]> {
    const cacheKey = monthId ? `transactions:${monthId}` : 'transactions:all';
    
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for transactions ${monthId ? monthId : 'all'}`);
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Redis cache error:', error);
    }

    console.log(`Cache miss for transactions ${monthId ? monthId : 'all'}, fetching from database`);
    
    const whereClause = monthId ? { monthId } : {};
    
    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify(transactions), { EX: 600 }); // Cache for 10 minutes
    } catch (error) {
      // Just log and continue - caching is a performance optimization, not critical path
      console.warn('Redis cache set error, but data was retrieved successfully:', error);
    }

    return transactions;
  }

  async show(id: number): Promise<any | null> {
    const cacheKey = `transaction:${id}`;
    
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for transaction ${id}`);
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Redis cache error:', error);
    }

    console.log(`Cache miss for transaction ${id}, fetching from database`);
    
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    if (!transaction) return null;
    
    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify(transaction), { EX: 600 }); // Cache for 10 minutes
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
    
    return transaction;
  }

  async store(
    transactionData: Omit<CoreTransaction, 'id'>, 
    prismaTransaction?: Prisma.TransactionClient
  ): Promise<any> {
    // Format amount values to ensure no undefined values
    const amountCAD = transactionData.amountCAD ?? 0;
    const amountUSD = transactionData.amountUSD ?? null;
    
    // Determine which Prisma client to use (transaction or main)
    const client = prismaTransaction || this.prisma;
    
    // Prepare create data
    const createData: any = {
      name: transactionData.name,
      amountCAD: amountCAD,
      amountUSD: amountUSD,
      notes: transactionData.notes ?? null,
      type: transactionData.type === TransactionType.INCOME ? 'Income' : 'Expense',
      date: transactionData.date,
      categoryId: transactionData.categoryId,
      monthId: transactionData.monthId,
      clerkId: transactionData.clerkId || 'anonymous' // Ensure clerkId always has a value
    };
    
    // Create transaction
    const transaction = await client.transaction.create({
      data: createData,
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });
  
    // Only invalidate caches if not using a transaction client
    if (!prismaTransaction) {
      try {
        await this.redis.del(`transactions:${transactionData.monthId}`);
        await this.redis.del(`transactions:all`);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return transaction;
  }

  /**
   * Ensures a string is a valid UUID format
   */
  private ensureValidUuid(userId: string): string {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // If already valid UUID
    if (uuidPattern.test(userId)) {
      return userId;
    }
    
    // Try to extract a valid UUID if the string contains one
    // This handles cases where userId might have a prefix
    const extractedUuid = userId.replace(/^[^0-9a-f]*/i, '');
    
    if (uuidPattern.test(extractedUuid)) {
      return extractedUuid;
    }
    
    // If we can't extract a valid UUID format, return the original
    return userId;
  }

  async update(id: number, data: Partial<CoreTransaction>): Promise<any> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.amountCAD !== undefined) updateData.amountCAD = data.amountCAD;
    if (data.amountUSD !== undefined) updateData.amountUSD = data.amountUSD;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.type !== undefined) updateData.type = data.type as TransactionType;
    if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
    
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    try {
      await this.redis.del(`transaction:${id}`);
      await this.redis.del(`transactions:${transaction.monthId}`);
      await this.redis.del(`transactions:all`);
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }

    return transaction;
  }

  async destroy(id: number): Promise<void> {
    // Get the transaction before deleting to know which month cache to invalidate
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      select: { monthId: true }
    });

    await this.prisma.transaction.delete({
      where: { id }
    });

    // Invalidate related caches
    if (transaction) {
      try {
        await this.redis.del(`transaction:${id}`);
        await this.redis.del(`transactions:${transaction.monthId}`);
        await this.redis.del(`transactions:all`);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }
  }

  async getTotalSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]> {
    const cacheKey = `spending:category:${monthId}`;
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for category spending ${monthId}`);
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Redis cache error:', error);
    }

    console.log(`Cache miss for category spending ${monthId}, fetching from database`);
    
    const spending = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { monthId, },
      _sum: { amountCAD: true },
      _count: { amountUSD: true }
    });

    // Get category names in a separate query
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: spending.map(s => s.categoryId) }
      },
      select: { id: true, name: true }
    });

    // Merge category names with spending data
    const result = spending.map(s => ({
      categoryId: s.categoryId,
      categoryName: categories.find(c => c.id === s.categoryId)?.name || '',
      totalSpent: Number(s._sum?.amountCAD || 0),
      transactionCount: s._count?.amountUSD || 0
    }));

    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify(result), { EX: 600 }); // Cache for 10 minutes
    } catch (error) {
      console.error('Redis cache set error:', error);
    }

    return result;
  }

  async getUSDSpendingByCategory(monthId: number): Promise<USDSpending[]> {
    const cacheKey = `spending:usd:${monthId}`;
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for USD spending ${monthId}`);
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Redis cache error:', error);
    }

    console.log(`Cache miss for USD spending ${monthId}, fetching from database`);
    
    const spending = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        monthId,
        amountUSD: { not: null }
      },
      _sum: { amountCAD: true },
      _count: { id: true }
    });

    const result = spending.map(s => ({
      categoryId: s.categoryId,
      _sum: {
        amountCAD: Number(s._sum.amountCAD)
      }
    }));

    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify(result), { EX: 600 }); // Cache for 10 minutes
    } catch (error) {
      console.error('Redis cache set error:', error);
    }

    return result;
  }

  async importTransactions(transactions: TransactionImportDTO[]): Promise<TransactionImportResultDTO> {
    const result: TransactionImportResultDTO = {
      successCount: 0,
      failedCount: 0,
      totalCount: transactions.length,
      errors: [],
      importedTransactions: []
    };

    // Use a transaction to ensure atomicity
    try {
      await this.prisma.$transaction(async (prisma) => {
        for (const transaction of transactions) {
          try {
            // Prepare data using the same structure as store method
            const createData: any = {
              name: transaction.name,
              amountCAD: transaction.amountCAD ?? 0,
              amountUSD: transaction.amountUSD ?? null,
              notes: transaction.notes || null,
              type: transaction.type === TransactionType.INCOME ? 'Income' : 'Expense',
              date: transaction.date,
              categoryId: transaction.categoryId,
              monthId: transaction.monthId
            };

            // Add clerkId if provided
            if (transaction.clerkId) {
              createData.clerkId = transaction.clerkId;
            }

            const createdTransaction = await prisma.transaction.create({
              data: createData,
              include: {
                category: {
                  select: {
                    name: true
                  }
                }
              }
            });

            result.successCount++;
            result.importedTransactions?.push(transaction);
          } catch (error) {
            result.failedCount++;
            result.errors?.push({
              row: result.successCount + result.failedCount,
              message: error instanceof Error ? error.message : 'Unknown error',
            });
            // Don't throw here, continue with other transactions
          }
        }
      });

      // Invalidate caches for all affected months
      const monthIds = new Set(transactions.map(t => t.monthId));
      try {
        for (const monthId of monthIds) {
          await this.redis.del(`transactions:${monthId}`);
        }
        await this.redis.del('transactions:all');
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }

      return result;
    } catch (error) {
      // Transaction failed entirely
      return {
        successCount: 0,
        failedCount: transactions.length,
        totalCount: transactions.length,
        errors: [{
          row: 0,
          message: error instanceof Error ? error.message : 'Unknown error during transaction import',
        }]
      };
    }
  }
}

