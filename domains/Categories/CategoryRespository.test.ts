import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryRepository } from './CategoryRepository';
import { Category } from './Category';
import { CategoryMapper } from './CategoryMapper';
import { PrismaClient } from '@prisma/client';
import type { RedisClient } from '@/infrastructure/redis';

describe('CategoryRepository', () => {
  // Mock PrismaClient
  const mockPrisma = {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    }
  } as unknown as PrismaClient;
  
  // Mock RedisClient
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn()
  } as unknown as RedisClient;
  
  const repository = new CategoryRepository(mockPrisma, mockRedis);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('index', () => {
    it('should return categories from cache if available', async () => {
      // Set up mocks
      const cachedCategories = [
        { id: 1, name: 'Food', type: 'expense', notes: null, createdAt: new Date(), isRecurring: false }
      ];
      
      mockRedis.get = vi.fn().mockResolvedValue(JSON.stringify(cachedCategories));
      
      // Execute
      const result = await repository.index();
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('categories:all');
      expect(mockPrisma.category.findMany).not.toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(Category);
    });
    
    it('should fetch categories from database on cache miss', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      
      const dbCategories = [
        { id: 1, name: 'Food', type: 'expense', notes: null, createdAt: new Date(), isRecurring: false }
      ];
      
      mockPrisma.category.findMany = vi.fn().mockResolvedValue(dbCategories);
      
      // Execute
      const result = await repository.index();
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('categories:all');
      expect(mockPrisma.category.findMany).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(Category);
    });
    
    it('should handle redis error and fall back to database', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockRejectedValue(new Error('Redis error'));
      
      const dbCategories = [
        { id: 1, name: 'Food', type: 'expense', notes: null, createdAt: new Date(), isRecurring: false }
      ];
      
      mockPrisma.category.findMany = vi.fn().mockResolvedValue(dbCategories);
      
      // Execute
      const result = await repository.index();
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('categories:all');
      expect(mockPrisma.category.findMany).toHaveBeenCalled();
      expect(result.length).toBe(1);
    });
  });
  
  describe('show', () => {
    it('should return category from cache if available', async () => {
      // Set up mocks
      const cachedCategory = 
        { id: 1, name: 'Food', type: 'expense', notes: null, createdAt: new Date(), isRecurring: false };
      
      mockRedis.get = vi.fn().mockResolvedValue(JSON.stringify(cachedCategory));
      
      // Execute
      const result = await repository.show(1);
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('category:1');
      expect(mockPrisma.category.findUnique).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(Category);
    });
    
    it('should return null when category not found', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.category.findUnique = vi.fn().mockResolvedValue(null);
      
      // Execute
      const result = await repository.show(999);
      
      // Assert
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBeNull();
    });
  });
  
  describe('store', () => {
    it('should store a category and invalidate cache', async () => {
      // Set up test data
      const categoryData = {
        name: 'Food',
        type: 'expense',
        notes: 'Grocery shopping',
        isRecurring: false
      };
      
      const createdCategory = {
        id: 1,
        ...categoryData,
        createdAt: new Date(),
      };
      
      // Set up mocks
      mockPrisma.category.create = vi.fn().mockResolvedValue(createdCategory);
      
      // Execute
      const result = await repository.store(new Category(categoryData));
      
      // Assert
      expect(mockPrisma.category.create).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('categories:all');
      expect(result).toBeInstanceOf(Category);
      expect(result.id).toBe(1);
    });
  });
  
  describe('findByName', () => {
    it('should return true when category exists', async () => {
      // Set up mocks
      mockPrisma.category.count = vi.fn().mockResolvedValue(1);
      
      // Execute
      const result = await repository.findByName('Food');
      
      // Assert
      expect(mockPrisma.category.count).toHaveBeenCalledWith({ where: { name: 'Food' } });
      expect(result).toBe(true);
    });
    
    it('should return false when category does not exist', async () => {
      // Set up mocks
      mockPrisma.category.count = vi.fn().mockResolvedValue(0);
      
      // Execute
      const result = await repository.findByName('NonExistent');
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe('hasTransactions', () => {
    it('should return correct transaction count from cache if available', async () => {
      // Set up mocks
      const cachedResult = { hasTransactions: true, count: 5 };
      mockRedis.get = vi.fn().mockResolvedValue(JSON.stringify(cachedResult));
      
      // Execute
      const result = await repository.hasTransactions(1);
      
      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('category:1:transactions');
      expect(mockPrisma.category.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual(cachedResult);
    });
    
    it('should fetch transaction count from database on cache miss', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      
      mockPrisma.category.findUnique = vi.fn().mockResolvedValue({
        id: 1,
        name: 'Food',
        type: 'expense',
        notes: null,
        createdAt: new Date(),
        isRecurring: false,
        transactions: [{ id: 1 }, { id: 2 }],
        recurringTransactions: [{ id: 3 }]
      });
      
      // Execute
      const result = await repository.hasTransactions(1);
      
      // Assert
      expect(mockPrisma.category.findUnique).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalled();
      expect(result).toEqual({ hasTransactions: true, count: 3 });
    });
    
    it('should return zero count when category not found', async () => {
      // Set up mocks
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.category.findUnique = vi.fn().mockResolvedValue(null);
      
      // Execute
      const result = await repository.hasTransactions(999);
      
      // Assert
      expect(result).toEqual({ hasTransactions: false, count: 0 });
    });
  });
});
