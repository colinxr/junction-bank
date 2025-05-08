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
}); 