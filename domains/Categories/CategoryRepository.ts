import { PrismaClient } from '@prisma/client';
import { ICategoryRepository } from './ICategoryRepository';
import { Category } from './Category';
import { CategoryMapper } from './CategoryMapper';
import { RedisClient } from '@/lib/redis';

export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient, private redis: RedisClient) {}
  
  async index(): Promise<Category[]> {
    const cacheKey = 'categories:all';
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log('Cache hit for categories');
        return JSON.parse(cachedData).map(CategoryMapper.toDomain);
      }
    } catch (error) {
      console.error('Redis cache error, falling back to database:', error);
    }
    
    // Cache miss or error, fetch from database
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify(categories), { EX: 3600 }); // Cache for 1 hour
    } catch (error) {
      console.warn('Redis cache set error, but data was retrieved successfully:', error);
    }
    
    return categories.map(CategoryMapper.toDomain);
  }
  
  async show(id: number): Promise<Category | null> {
    const cacheKey = `category:${id}`;
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for category ${id}`);
        return CategoryMapper.toDomain(JSON.parse(cachedData));
      }
    } catch (error) {
      console.error('Redis cache error, falling back to database:', error);
    }
    
    const category = await this.prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) return null;
    
    // Store in cache
    try {
      await this.redis.set(cacheKey, JSON.stringify(category), { EX: 3600 }); // Cache for 1 hour
    } catch (error) {
      console.warn('Redis cache set error, but data was retrieved successfully:', error);
    }
    
    return CategoryMapper.toDomain(category);
  }
  
  async store(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const prismaData = CategoryMapper.toPersistence(categoryData);
    
    const created = await this.prisma.category.create({
      data: prismaData
    });
    
    // Invalidate relevant caches
    try {
      await this.redis.del('categories:all');
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
    
    return CategoryMapper.toDomain(created);
  }
  
  async destroy(id: number): Promise<void> {
    await this.prisma.category.delete({
      where: { id }
    });
    
    // Invalidate relevant caches
    try {
      await this.redis.del(`category:${id}`);
      await this.redis.del('categories:all');
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
  }
  
  async findByName(name: string): Promise<boolean> {
    // This is a simple check, not worth caching
    const count = await this.prisma.category.count({
      where: { name }
    });
    return count > 0;
  }
  
  async hasTransactions(id: number): Promise<{hasTransactions: boolean, count: number}> {
    const cacheKey = `category:${id}:transactions`;
    
    // Try to get from cache first
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for category ${id} transactions`);
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Redis cache error, falling back to database:', error);
    }
    
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        transactions: {
          select: { id: true }
        },
        recurringTransactions: {
          select: { id: true }
        }
      }
    });

    if (!category) {
      return { hasTransactions: false, count: 0 };
    }

    const transactionCount = 
      category.transactions.length + 
      category.recurringTransactions.length;
    
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