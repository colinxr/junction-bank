import { PrismaClient } from '@prisma/client';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';
import { CategoryMapper } from '../../mappers/CategoryMapper';

export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}
  
  async index(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    return categories.map(CategoryMapper.toDomain);
  }
  
  async show(id: number): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) return null;
    return CategoryMapper.toDomain(category);
  }
  
  async store(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const prismaData = CategoryMapper.toPersistence(categoryData);
    
    const created = await this.prisma.category.create({
      data: prismaData
    });
    
    return CategoryMapper.toDomain(created);
  }
  
  async destroy(id: number): Promise<void> {
    await this.prisma.category.delete({
      where: { id }
    });
  }
  
  async findByName(name: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { name }
    });
    return count > 0;
  }
  
  async hasTransactions(id: number): Promise<{hasTransactions: boolean, count: number}> {
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
      
    return { 
      hasTransactions: transactionCount > 0,
      count: transactionCount
    };
  }
} 