import { ITransactionRepository } from "@/domain/repositories/ITransactionRepository";
import { PrismaClient } from "@prisma/client";
import { Transaction as DomainTransaction, TransactionType } from "@/domain/entities/Transaction";
import { Transaction, USDSpending } from "@/app/types";
import { CategorySpendingDTO } from "@/application/dtos/transaction/TransactionDTO";

export class TransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async index(monthId?: number): Promise<{data: Transaction[], pagination: {total: number}}> {
    // Get count for pagination
    const totalCount = await this.prisma.transaction.count();

    // Execute query with pagination and filtering
    const transactions = await this.prisma.transaction.findMany({
      where: { monthId: monthId ?? undefined },
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
      data: transactions.map(transaction => ({
        ...transaction,
        createdAt: transaction.createdAt.toISOString(),
        category: transaction.category?.name,
        type: transaction.type === 'Income' ? TransactionType.INCOME : TransactionType.EXPENSE
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
    
    return {
      ...transaction,
      createdAt: transaction.createdAt.toISOString(),
      category: transaction.category?.name,
      type: transaction.type === 'Income' ? TransactionType.INCOME : TransactionType.EXPENSE
    };
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
      // Convert domain enum to string for Prisma
      type: transactionData.type === TransactionType.INCOME ? 'Income' : 'Expense',
      monthId: transactionData.monthId,
      date: transactionData.date
    };

    // Create transaction
    const created = await this.prisma.transaction.create({
      data: prismaData as any,
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });
    
    return {
      ...created,
      createdAt: created.createdAt.toISOString(),
      category: created.category?.name,
      type: created.type === 'Income' ? TransactionType.INCOME : TransactionType.EXPENSE
    };
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
    return spending.map(s => ({
      categoryId: s.categoryId,
      categoryName: categories.find(c => c.id === s.categoryId)?.name || '',
      totalSpent: Number(s._sum?.amountCAD || 0),
      transactionCount: s._count?.amountUSD || 0
    }));
  }

  async getUSDSpendingByCategory(monthId: number): Promise<USDSpending[]> {
    const spending = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        monthId,
        amountUSD: { not: null }
      },
      _sum: { amountCAD: true },
      _count: { id: true }
    });

    return spending.map(s => ({
      categoryId: s.categoryId,
      _sum: {
        amountCAD: s._sum.amountCAD
      }
    }));
  }

  // Helper method to convert Prisma model to domain entity if needed
  private toDomainEntity(prismaTransaction: any): DomainTransaction {
    return DomainTransaction.create({
      id: prismaTransaction.id,
      userId: prismaTransaction.userId,
      name: prismaTransaction.name,
      amountCAD: Number(prismaTransaction.amountCAD),
      amountUSD: prismaTransaction.amountUSD ? Number(prismaTransaction.amountUSD) : undefined,
      categoryId: prismaTransaction.categoryId,
      notes: prismaTransaction.notes || undefined,
      // Convert Prisma enum string to domain enum
      type: prismaTransaction.type === 'Income' ? TransactionType.INCOME : TransactionType.EXPENSE,
      date: prismaTransaction.date,
      monthId: prismaTransaction.monthId,
      createdAt: prismaTransaction.createdAt
    });
  }
}

