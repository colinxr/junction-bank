import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MonthRepository } from './MonthRepository';
import { Month } from './Month';
import { MonthMapper } from './MonthMapper';
import { PrismaClient, Prisma } from '@prisma/client';
import type { RedisClient } from '@/infrastructure/redis';

describe('MonthRepository', () => {
  // Create mock Prisma Decimal values
  const createDecimal = (value: number) => {
    return {
      d: [value],
      toNumber: () => value,
      toString: () => value.toString()
    } as unknown as Prisma.Decimal;
  };

  // Mock PrismaClient
  const mockPrisma = {
    month: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    $queryRaw: vi.fn()
  } as unknown as PrismaClient;
  
  // Mock RedisClient
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn()
  } as unknown as RedisClient;
  
  const repository = new MonthRepository(mockPrisma, mockRedis);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('index', () => {
    it('should return months from cache if available', async () => {
      // Set up mocks
      const cachedData = {
        months: [
          { id: 1, month: 3, year: 2023, notes: 'Test month', totalIncome: createDecimal(5000), totalExpenses: createDecimal(3000), recurringExpenses: createDecimal(1500), transactionCount: 10, createdAt: new Date() }
        ],
        pagination: { total: 1 }
      };
      
      mockRedis.get = vi.fn().mockResolvedValue(JSON.stringify(cachedData));
      
      // Execute
      const result = await repository.index();
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('months:all');
      expect(mockPrisma.month.findMany).not.toHaveBeenCalled();
      expect(result.data.length).toBe(1);
      expect(result.data[0]).toBeInstanceOf(Month);
      expect(result.pagination.total).toBe(1);
    });
    
    it('should fetch months from database on cache miss', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      
      const dbMonths = [
        { id: 1, month: 3, year: 2023, notes: 'Test month', totalIncome: createDecimal(5000), totalExpenses: createDecimal(3000), recurringExpenses: createDecimal(1500), transactionCount: 10, createdAt: new Date() }
      ];
      
      mockPrisma.month.count = vi.fn().mockResolvedValue(1);
      mockPrisma.month.findMany = vi.fn().mockResolvedValue(dbMonths);
      
      // Execute
      const result = await repository.index();
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('months:all');
      expect(mockPrisma.month.findMany).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalled();
      expect(result.data.length).toBe(1);
      expect(result.data[0]).toBeInstanceOf(Month);
      expect(result.pagination.total).toBe(1);
    });
    
    it('should handle redis error and fall back to database', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockRejectedValue(new Error('Redis error'));
      
      const dbMonths = [
        { id: 1, month: 3, year: 2023, notes: 'Test month', totalIncome: createDecimal(5000), totalExpenses: createDecimal(3000), recurringExpenses: createDecimal(1500), transactionCount: 10, createdAt: new Date() }
      ];
      
      mockPrisma.month.count = vi.fn().mockResolvedValue(1);
      mockPrisma.month.findMany = vi.fn().mockResolvedValue(dbMonths);
      
      // Execute
      const result = await repository.index();
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('months:all');
      expect(mockPrisma.month.findMany).toHaveBeenCalled();
      expect(result.data.length).toBe(1);
      expect(result.pagination.total).toBe(1);
    });
  });
  
  describe('show', () => {
    it('should return month from cache if available', async () => {
      // Set up mocks
      const cachedMonth = 
        { id: 1, month: 3, year: 2023, notes: 'Test month', totalIncome: createDecimal(5000), totalExpenses: createDecimal(3000), recurringExpenses: createDecimal(1500), transactionCount: 10, createdAt: new Date() };
      
      mockRedis.get = vi.fn().mockResolvedValue(JSON.stringify(cachedMonth));
      
      // Execute
      const result = await repository.show(1);
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('month:1');
      expect(mockPrisma.month.findUnique).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(Month);
    });
    
    it('should return null when month not found', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(null);
      
      // Execute
      const result = await repository.show(999);
      
      // Assert
      expect(mockPrisma.month.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBeNull();
    });
  });
  
  describe('findByDate', () => {
    it('should find month by month and year', async () => {
      // Set up test data
      const monthData = { 
        id: 1, 
        month: 3, 
        year: 2023, 
        notes: 'Test month', 
        totalIncome: createDecimal(5000), 
        totalExpenses: createDecimal(3000), 
        recurringExpenses: createDecimal(1500), 
        transactionCount: 10, 
        createdAt: new Date() 
      };
      
      // Set up mocks
      mockPrisma.month.findFirst = vi.fn().mockResolvedValue(monthData);
      
      // Execute
      const result = await repository.findByDate(3, 2023);
      
      // Assert
      expect(mockPrisma.month.findFirst).toHaveBeenCalledWith({
        where: { month: 3, year: 2023 }
      });
      expect(result).toBeInstanceOf(Month);
      expect(result?.month).toBe(3);
      expect(result?.year).toBe(2023);
    });
    
    it('should return null when month not found by date', async () => {
      // Set up mocks
      mockPrisma.month.findFirst = vi.fn().mockResolvedValue(null);
      
      // Execute
      const result = await repository.findByDate(12, 2099);
      
      // Assert
      expect(mockPrisma.month.findFirst).toHaveBeenCalledWith({
        where: { month: 12, year: 2099 }
      });
      expect(result).toBeNull();
    });
  });
  
  describe('store', () => {
    it('should store a month and invalidate cache', async () => {
      // Set up test data
      const monthData = {
        month: 4,
        year: 2023,
        notes: 'New month'
      };
      
      const createdMonth = {
        id: 1,
        month: 4,
        year: 2023,
        notes: 'New month',
        totalIncome: createDecimal(0),
        totalExpenses: createDecimal(0),
        recurringExpenses: createDecimal(0),
        transactionCount: 0,
        createdAt: new Date()
      };
      
      // Set up mocks
      mockPrisma.month.create = vi.fn().mockResolvedValue(createdMonth);
      
      // Execute
      const result = await repository.store(new Month(monthData));
      
      // Assert
      expect(mockPrisma.month.create).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('months:all');
      expect(mockRedis.del).toHaveBeenCalledWith('month:date:4:2023');
      expect(result).toBeInstanceOf(Month);
      expect(result.id).toBe(1);
    });
  });
  
  describe('update', () => {
    it('should update a month and invalidate cache', async () => {
      // Set up test data
      const updateData = {
        notes: 'Updated notes'
      };
      
      const updatedMonth = {
        id: 1,
        month: 4,
        year: 2023,
        notes: 'Updated notes',
        totalIncome: createDecimal(0),
        totalExpenses: createDecimal(0),
        recurringExpenses: createDecimal(0),
        transactionCount: 0,
        createdAt: new Date()
      };
      
      // Set up mocks
      mockPrisma.month.update = vi.fn().mockResolvedValue(updatedMonth);
      
      // Execute
      const result = await repository.update(1, updateData);
      
      // Assert
      expect(mockPrisma.month.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { notes: 'Updated notes' }
      });
      expect(mockRedis.del).toHaveBeenCalledWith('month:1');
      expect(mockRedis.del).toHaveBeenCalledWith('months:all');
      expect(mockRedis.del).toHaveBeenCalledWith('month:date:4:2023');
      expect(result).toBeInstanceOf(Month);
      expect(result.notes).toBe('Updated notes');
    });
  });
  
  describe('findByMonthAndYear', () => {
    it('should return true when month exists', async () => {
      // Set up mocks
      mockPrisma.month.count = vi.fn().mockResolvedValue(1);
      
      // Execute
      const result = await repository.findByMonthAndYear(5, 2023);
      
      // Assert
      expect(mockPrisma.month.count).toHaveBeenCalledWith({
        where: { month: 5, year: 2023 }
      });
      expect(result).toBe(true);
    });
    
    it('should return false when month does not exist', async () => {
      // Set up mocks
      mockPrisma.month.count = vi.fn().mockResolvedValue(0);
      
      // Execute
      const result = await repository.findByMonthAndYear(12, 2099);
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe('findLatest', () => {
    it('should return the latest month from cache if available', async () => {
      // Set up test data
      const latestMonth = {
        id: 3,
        month: 12,
        year: 2023,
        notes: 'Latest month',
        totalIncome: createDecimal(8000),
        totalExpenses: createDecimal(5000),
        recurringExpenses: createDecimal(2000),
        transactionCount: 20,
        createdAt: new Date()
      };
      
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(JSON.stringify(latestMonth));
      
      // Execute
      const result = await repository.findLatest();
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('month:latest');
      expect(mockPrisma.month.findFirst).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(Month);
      expect(result?.id).toBe(3);
      expect(result?.month).toBe(12);
      expect(result?.year).toBe(2023);
    });
    
    it('should return latest month from database on cache miss', async () => {
      // Set up test data
      const latestMonth = {
        id: 2,
        month: 11,
        year: 2023,
        notes: 'Latest from DB',
        totalIncome: createDecimal(7000),
        totalExpenses: createDecimal(4000),
        recurringExpenses: createDecimal(1800),
        transactionCount: 15,
        createdAt: new Date()
      };
      
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.month.findFirst = vi.fn().mockResolvedValue(latestMonth);
      mockRedis.set = vi.fn().mockResolvedValue('OK');
      
      // Execute
      const result = await repository.findLatest();
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('month:latest');
      expect(mockPrisma.month.findFirst).toHaveBeenCalledWith({
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ]
      });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'month:latest',
        JSON.stringify(latestMonth),
        { EX: 1800 }
      );
      expect(result).toBeInstanceOf(Month);
      expect(result?.id).toBe(2);
    });
    
    it('should return null when no months exist', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.month.findFirst = vi.fn().mockResolvedValue(null);
      mockRedis.set = vi.fn().mockResolvedValue('OK');
      
      // Execute
      const result = await repository.findLatest();
      
      // Assert
      expect(mockPrisma.month.findFirst).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalledWith('month:latest', 'null', { EX: 1800 });
      expect(result).toBeNull();
    });
    
    it('should return null from cache when cached as null', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue('null');
      
      // Execute
      const result = await repository.findLatest();
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('month:latest');
      expect(mockPrisma.month.findFirst).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
    
    it('should handle redis error and fall back to database', async () => {
      // Set up test data
      const latestMonth = {
        id: 1,
        month: 10,
        year: 2023,
        notes: 'Fallback month',
        totalIncome: createDecimal(6000),
        totalExpenses: createDecimal(3000),
        recurringExpenses: createDecimal(1500),
        transactionCount: 12,
        createdAt: new Date()
      };
      
      // Set up mocks
      mockRedis.get = vi.fn().mockRejectedValue(new Error('Redis error'));
      mockPrisma.month.findFirst = vi.fn().mockResolvedValue(latestMonth);
      
      // Execute
      const result = await repository.findLatest();
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('month:latest');
      expect(mockPrisma.month.findFirst).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Month);
      expect(result?.id).toBe(1);
    });
  });
  
  describe('destroy', () => {
    it('should delete month and invalidate cache', async () => {
      // Set up test data
      const monthToDelete = {
        month: 6,
        year: 2023
      };
      
      // Set up mocks
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(monthToDelete);
      mockPrisma.month.delete = vi.fn().mockResolvedValue(undefined);
      mockRedis.del = vi.fn().mockResolvedValue(1);
      
      // Execute
      await repository.destroy(5);
      
      // Assert
      expect(mockPrisma.month.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
        select: { month: true, year: true }
      });
      expect(mockPrisma.month.delete).toHaveBeenCalledWith({
        where: { id: 5 }
      });
      
      // Verify cache invalidation
      expect(mockRedis.del).toHaveBeenCalledWith('month:5');
      expect(mockRedis.del).toHaveBeenCalledWith('months:all');
      expect(mockRedis.del).toHaveBeenCalledWith('month:latest');
      expect(mockRedis.del).toHaveBeenCalledWith('month:date:6:2023');
    });
    
    it('should handle deletion of non-existent month', async () => {
      // Set up mocks
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(null);
      mockPrisma.month.delete = vi.fn().mockResolvedValue(undefined);
      mockRedis.del = vi.fn().mockResolvedValue(1);
      
      // Execute
      await repository.destroy(999);
      
      // Assert
      expect(mockPrisma.month.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: { month: true, year: true }
      });
      expect(mockPrisma.month.delete).toHaveBeenCalledWith({
        where: { id: 999 }
      });
      
      // Should still invalidate general caches but not date-specific cache
      expect(mockRedis.del).toHaveBeenCalledWith('month:999');
      expect(mockRedis.del).toHaveBeenCalledWith('months:all');
      expect(mockRedis.del).toHaveBeenCalledWith('month:latest');
      expect(mockRedis.del).not.toHaveBeenCalledWith(expect.stringMatching(/month:date:/));
    });
    
    it('should handle database errors during deletion', async () => {
      // Set up mocks
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue({ month: 5, year: 2023 });
      mockPrisma.month.delete = vi.fn().mockRejectedValue(new Error('Database error'));
      
      // Execute and expect error
      await expect(repository.destroy(1)).rejects.toThrow('Database error');
      
      // Assert that find was called but delete failed
      expect(mockPrisma.month.findUnique).toHaveBeenCalled();
      expect(mockPrisma.month.delete).toHaveBeenCalled();
    });
    
    it('should handle redis cache errors during invalidation', async () => {
      // Set up test data
      const monthToDelete = {
        month: 7,
        year: 2023
      };
      
      // Set up mocks
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(monthToDelete);
      mockPrisma.month.delete = vi.fn().mockResolvedValue(undefined);
      mockRedis.del = vi.fn().mockRejectedValue(new Error('Redis error'));
      
      // Execute - should not throw despite redis error
      await expect(repository.destroy(3)).resolves.not.toThrow();
      
      // Assert that delete was still called
      expect(mockPrisma.month.delete).toHaveBeenCalledWith({
        where: { id: 3 }
      });
    });
  });
  
  describe('hasTransactions', () => {
    it('should return true with count when month has transactions from cache', async () => {
      // Set up test data
      const cachedResult = {
        hasTransactions: true,
        count: 5
      };
      
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(JSON.stringify(cachedResult));
      
      // Execute
      const result = await repository.hasTransactions(1);
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('month:1:transactions');
      expect(mockPrisma.month.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual({
        hasTransactions: true,
        count: 5
      });
    });
    
    it('should return true with count when month has transactions from database', async () => {
      // Set up test data
      const monthWithTransactions = {
        id: 1,
        transactions: [{ id: 1 }, { id: 2 }, { id: 3 }]
      };
      
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(monthWithTransactions);
      mockRedis.set = vi.fn().mockResolvedValue('OK');
      
      // Execute
      const result = await repository.hasTransactions(1);
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('month:1:transactions');
      expect(mockPrisma.month.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          transactions: {
            select: { id: true }
          }
        }
      });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'month:1:transactions',
        JSON.stringify({ hasTransactions: true, count: 3 }),
        { EX: 1800 }
      );
      expect(result).toEqual({
        hasTransactions: true,
        count: 3
      });
    });
    
    it('should return false with zero count when no transactions', async () => {
      // Set up test data
      const monthWithoutTransactions = {
        id: 2,
        transactions: []
      };
      
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(monthWithoutTransactions);
      mockRedis.set = vi.fn().mockResolvedValue('OK');
      
      // Execute
      const result = await repository.hasTransactions(2);
      
      // Assert
      expect(result).toEqual({
        hasTransactions: false,
        count: 0
      });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'month:2:transactions',
        JSON.stringify({ hasTransactions: false, count: 0 }),
        { EX: 1800 }
      );
    });
    
    it('should handle non-existent month', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(null);
      
      // Execute
      const result = await repository.hasTransactions(999);
      
      // Assert
      expect(mockPrisma.month.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: {
          transactions: {
            select: { id: true }
          }
        }
      });
      expect(result).toEqual({
        hasTransactions: false,
        count: 0
      });
    });
    
    it('should handle redis error and fall back to database', async () => {
      // Set up test data
      const monthWithTransactions = {
        id: 1,
        transactions: [{ id: 1 }, { id: 2 }]
      };
      
      // Set up mocks
      mockRedis.get = vi.fn().mockRejectedValue(new Error('Redis error'));
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(monthWithTransactions);
      
      // Execute
      const result = await repository.hasTransactions(1);
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('month:1:transactions');
      expect(mockPrisma.month.findUnique).toHaveBeenCalled();
      expect(result).toEqual({
        hasTransactions: true,
        count: 2
      });
    });
  });
  
  describe('recalculateRecurringExpenses', () => {
    it('should recalculate for specific month', async () => {
      // Set up test data
      const month = {
        id: 1,
        month: 6,
        year: 2023
      };
      
      const recurringExpensesResult = [{ total: 1500 }];
      
      // Set up mocks
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(month);
      mockPrisma.$queryRaw = vi.fn().mockResolvedValue(recurringExpensesResult);
      mockPrisma.month.update = vi.fn().mockResolvedValue(undefined);
      mockRedis.del = vi.fn().mockResolvedValue(1);
      
      // Execute
      await repository.recalculateRecurringExpenses(1);
      
      // Assert
      expect(mockPrisma.month.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(mockPrisma.month.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { recurringExpenses: 1500 }
      });
      
      // Verify cache invalidation
      expect(mockRedis.del).toHaveBeenCalledWith('month:1');
      expect(mockRedis.del).toHaveBeenCalledWith('month:1:details');
      expect(mockRedis.del).toHaveBeenCalledWith('month:date:6:2023');
    });
    
    it('should handle non-existent month when recalculating specific month', async () => {
      // Set up mocks
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(null);
      
      // Execute
      await repository.recalculateRecurringExpenses(999);
      
      // Assert
      expect(mockPrisma.month.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
      expect(mockPrisma.month.update).not.toHaveBeenCalled();
    });
    
    it('should recalculate for all months when no monthId provided', async () => {
      // Set up mocks
      mockPrisma.$executeRaw = vi.fn().mockResolvedValue(undefined);
      mockRedis.del = vi.fn().mockResolvedValue(1);
      
      // Execute
      await repository.recalculateRecurringExpenses();
      
      // Assert
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('months:all');
    });
    
    it('should handle calculation errors for specific month', async () => {
      // Set up test data
      const month = {
        id: 1,
        month: 6,
        year: 2023
      };
      
      // Set up mocks
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(month);
      mockPrisma.$queryRaw = vi.fn().mockRejectedValue(new Error('Query failed'));
      
      // Execute and expect error
      await expect(repository.recalculateRecurringExpenses(1)).rejects.toThrow('Query failed');
      
      // Assert that find was called but query failed
      expect(mockPrisma.month.findUnique).toHaveBeenCalled();
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(mockPrisma.month.update).not.toHaveBeenCalled();
    });
    
    it('should handle calculation errors for all months', async () => {
      // Set up mocks
      mockPrisma.$executeRaw = vi.fn().mockRejectedValue(new Error('Bulk update failed'));
      
      // Execute and expect error
      await expect(repository.recalculateRecurringExpenses()).rejects.toThrow('Bulk update failed');
      
      // Assert that execute was called
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
    
    it('should handle redis cache errors during invalidation', async () => {
      // Set up test data
      const month = {
        id: 2,
        month: 7,
        year: 2023
      };
      
      const recurringExpensesResult = [{ total: 2000 }];
      
      // Set up mocks
      mockPrisma.month.findUnique = vi.fn().mockResolvedValue(month);
      mockPrisma.$queryRaw = vi.fn().mockResolvedValue(recurringExpensesResult);
      mockPrisma.month.update = vi.fn().mockResolvedValue(undefined);
      mockRedis.del = vi.fn().mockRejectedValue(new Error('Redis error'));
      
      // Execute - currently the method throws when Redis fails
      await expect(repository.recalculateRecurringExpenses(2)).rejects.toThrow('Redis error');
      
      // Assert that database operations were completed before Redis failure
      expect(mockPrisma.month.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { recurringExpenses: 2000 }
      });
    });
  });
}); 