import { PrismaClient, Prisma } from '@prisma/client';
import { IMonthRepository } from '../../../domain/repositories/IMonthRepository';
import { Month } from '../../../domain/entities/Month';
import { MonthMapper } from '../../mappers/MonthMapper';

export class MonthRepository implements IMonthRepository {
  constructor(private prisma: PrismaClient) {}

  async index(): Promise<{data: Month[], pagination: any}> {
    // Get count for pagination
    const totalCount = await this.prisma.month.count();

    // Execute query with pagination and filtering
    const months = await this.prisma.month.findMany({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ],
    });

    return {
      data: months.map(MonthMapper.toDomain),
      pagination: {
        total: totalCount,
      }
    };
  }

  async show(id: number): Promise<Month | null> {
    const month = await this.prisma.month.findUnique({
      where: { id }
    });

    if (!month) return null;
    return MonthMapper.toDomain(month);
  }

  async findByDate(month: number, year: number): Promise<Month | null> {
    const result = await this.prisma.month.findFirst({
      where: { month, year }
    });

    if (!result) return null;
    return MonthMapper.toDomain(result);
  }

  async store(monthData: Omit<Month, 'id' | 'createdAt' | 'totalIncome' | 'totalExpenses'>): Promise<Month> {
    const prismaData = MonthMapper.toPersistence(monthData);

    const created = await this.prisma.month.create({
      data: prismaData
    });

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

    return MonthMapper.toDomain(updated);
  }

  async destroy(id: number): Promise<void> {
    await this.prisma.month.delete({
      where: { id }
    });
  }

  async findByMonthAndYear(month: number, year: number): Promise<boolean> {
    const count = await this.prisma.month.count({
      where: {
        month,
        year
      }
    });
    return count > 0;
  }

  async hasTransactions(id: number): Promise<{hasTransactions: boolean, count: number}> {
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

    return {
      hasTransactions: transactionCount > 0,
      count: transactionCount
    };
  }
} 