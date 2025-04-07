import { ITransactionRepository } from "@/domain/repositories/ITransactionRepository";
import { PrismaClient } from "@prisma/client";
import { Transaction, TransactionType } from "@/domain/entities/Transaction";
import { TransactionMapper } from "../../mappers/TransactionMapper";
import { CategorySpendingDTO } from "@/application/dtos/transaction/TransactionDTO";

export class TransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async index(): Promise<{data: Transaction[], pagination: {total: number}}> {
    // Get count for pagination
    const totalCount = await this.prisma.transaction.count();

    // Execute query with pagination and filtering
    const transactions = await this.prisma.transaction.findMany({
      orderBy: [
        { name: 'asc' }
      ],
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    return {
      data: transactions.map(t => TransactionMapper.toDomain({
        ...t,
        updatedAt: t.createdAt // Use createdAt as a fallback
      })),
      pagination: {
        total: totalCount,
      }
    };
  }

  async show(id: number): Promise<Transaction | null> {
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
    
    // Add updatedAt property to match TransactionModel interface
    const transactionWithUpdated = {
      ...transaction,
      updatedAt: transaction.createdAt // Use createdAt as a fallback
    };
    
    return TransactionMapper.toDomain(transactionWithUpdated);
  }

  async store(transactionData: Omit<Transaction, 'id' | 'validate' | 'isIncome' | 'isExpense'>): Promise<Transaction> {
    // Extract only the fields Prisma needs and convert to the format it expects
    const prismaData = {
      userId: transactionData.userId,
      name: transactionData.name,
      amountCAD: transactionData.amountCAD,
      amountUSD: transactionData.amountUSD || null,
      categoryId: transactionData.categoryId,
      notes: transactionData.notes || null,
      // Convert enum to string for Prisma
      type: transactionData.type as unknown as string,
      monthId: transactionData.monthId!,
      date: transactionData.date!
    };

    // Cast to any to bypass TypeScript's type checking with Prisma
    const created = await this.prisma.transaction.create({
      data: prismaData as any
    });

    return TransactionMapper.toDomain({
      ...created,
      updatedAt: created.createdAt // Use createdAt as a fallback
    });
  }

  async getTotalSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]> {
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
      ...s,
      categoryName: categories.find(c => c.id === s.categoryId)?.name || ''
    }));

    return result.map(item => TransactionMapper.toCategorySpendingDTO(item));
  }

  async getUSDSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]> {
    const spending = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        monthId,
        amountUSD: { not: null }
      },
      _sum: { amountCAD: true },
      _count: { id: true }
    });

    // Get category names
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: spending.map(s => s.categoryId) }
      },
      select: { id: true, name: true }
    });

    // Merge data
    const result = spending.map(s => ({
      ...s,
      categoryName: categories.find(c => c.id === s.categoryId)?.name || ''
    }));

    return result.map(item => TransactionMapper.toCategorySpendingDTO(item));
  }
}

