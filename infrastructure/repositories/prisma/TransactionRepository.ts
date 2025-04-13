import { ITransactionRepository } from "@/domain/repositories/ITransactionRepository";
import { PrismaClient, Prisma } from "@prisma/client";
import { Transaction as DomainTransaction, TransactionType } from "@/domain/entities/Transaction";
import { Transaction, USDSpending } from "@/app/types";
import { CategorySpendingDTO, TransactionDTO } from "@/application/dtos/transaction/TransactionDTO";
import { TransactionMapper } from '../../mappers/TransactionMapper';
import { TransactionModel } from "../../persistence/TransactionModel";
export class TransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async index(monthId?: number): Promise<TransactionModel[]> {
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

    return transactions
  }

  async show(id: number): Promise<TransactionModel | null> {
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
    
    return transaction;
  }

  async store(transactionData: Omit<Transaction, 'id' | 'validate' | 'isIncome' | 'isExpense'>): Promise<TransactionModel> {
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

    return created;
  }

  async update(id: number, data: Partial<Transaction>): Promise<TransactionModel> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.amountCAD !== undefined) updateData.amountCAD = data.amountCAD;
    if (data.amountUSD !== undefined) updateData.amountUSD = data.amountUSD;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.type !== undefined) updateData.type = data.type as TransactionType;
    if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
    
    return await this.prisma.transaction.update({
      where: { id },
      data: updateData
    });
  }

  async destroy(id: number): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id }
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
      categoryName: prismaTransaction.category?.name ?? '',
      notes: prismaTransaction.notes || undefined,
      // Convert Prisma enum string to domain enum
      type: prismaTransaction.type === 'Income' ? TransactionType.INCOME : TransactionType.EXPENSE,
      date: prismaTransaction.date,
      monthId: prismaTransaction.monthId,
      createdAt: prismaTransaction.createdAt
    });
  }
}

