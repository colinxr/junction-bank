import { PrismaClient, Prisma } from '@prisma/client';
import { IRecurringTransactionRepository } from './IRecurringTransactionRepository';
import { RecurringTransaction, TransactionType } from './RecurringTransaction';
import { RecurringTransactionMapper } from './RecurringTransactionMapper';

export class RecurringTransactionRepository implements IRecurringTransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async index(): Promise<{data: RecurringTransaction[], pagination: any}> {

    // Get count for pagination
    const totalCount = await this.prisma.recurringTransaction.count();

    // Execute query with pagination and filtering
    const recurringTransactions = await this.prisma.recurringTransaction.findMany({
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
      data: recurringTransactions.map(rt => RecurringTransactionMapper.toDomain(rt)),
      pagination: {
        total: totalCount,
      }
    };
  }

  async show(id: number): Promise<RecurringTransaction | null> {
    const recurringTransaction = await this.prisma.recurringTransaction.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    if (!recurringTransaction) return null;
    return RecurringTransactionMapper.toDomain(recurringTransaction);
  }

  async store(recurringTransactionData: Omit<RecurringTransaction, 'id' | 'createdAt'>): Promise<RecurringTransaction> {
    const prismaData = RecurringTransactionMapper.toPersistence(recurringTransactionData);

    const created = await this.prisma.recurringTransaction.create({
      data: prismaData
    });

    return RecurringTransactionMapper.toDomain(created);
  }

  async update(id: number, data: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    const updateData: Prisma.RecurringTransactionUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.amountCAD !== undefined) updateData.amountCAD = data.amountCAD;
    if (data.amountUSD !== undefined) updateData.amountUSD = data.amountUSD;
    if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.dayOfMonth !== undefined) updateData.dayOfMonth = data.dayOfMonth;
    if (data.type !== undefined) updateData.type = data.type as TransactionType;

    const updated = await this.prisma.recurringTransaction.update({
      where: { id },
      data: updateData
    });

    return RecurringTransactionMapper.toDomain(updated);
  }

  async destroy(id: number): Promise<void> {
    await this.prisma.recurringTransaction.delete({
      where: { id }
    });
  }

  async findByName(name: string): Promise<boolean> {
    const count = await this.prisma.recurringTransaction.count({
      where: {
        name
      }
    });
    return count > 0;
  }
  
  async applyToMonth(monthId: number, month: number, year: number): Promise<number> {
    const recurringTransactions = await this.prisma.recurringTransaction.findMany();
    let transactionsCreated = 0;
    
    // Implementation to create regular transactions from recurring ones
    for (const rt of recurringTransactions) {
      // Make sure both USD and CAD values are passed to the transaction
      // The currency values from recurring transactions should already have proper conversions
      // from when they were created or updated
      await this.prisma.transaction.create({
        data: {
          clerkId: rt.clerkId,
          monthId: monthId,
          name: rt.name,
          amountCAD: rt.amountCAD,
          amountUSD: rt.amountUSD,
          categoryId: rt.categoryId,
          notes: rt.notes,
          date: new Date(year, month - 1, rt.dayOfMonth || 1),
          type: rt.type
        }
      });
      
      transactionsCreated++;
    }
    
    // Update month total income/expenses as needed
    await this.updateMonthTotals(monthId);
    
    return transactionsCreated;
  }
  
  private async updateMonthTotals(monthId: number): Promise<void> {
    // Calculate totals for the month
    const totals = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { monthId },
      _sum: { amountCAD: true }
    });
    
    // Prepare update data
    let totalIncome = 0;
    let totalExpenses = 0;
    
    for (const total of totals) {
      if (total.type === 'Income') {
        totalIncome = Number(total._sum.amountCAD || 0);
      } else if (total.type === 'Expense') {
        totalExpenses = Number(total._sum.amountCAD || 0);
      }
    }
    
    // Update the month record
    await this.prisma.month.update({
      where: { id: monthId },
      data: {
        totalIncome,
        totalExpenses,
        transactionCount: {
          increment: 1
        }
      }
    });
  }
} 