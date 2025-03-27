import { TransactionFactory } from "../factories/transaction.factory";
import { PrismaClient } from "@prisma/client";
import { getMonthName, formatCurrency } from "../utils";

export class TransactionService {
  private prisma: PrismaClient;
  private transactionFactory: TransactionFactory;

  constructor(prisma: PrismaClient) {
    // Use the shared prisma client with middleware
    this.prisma = prisma;
    this.transactionFactory = new TransactionFactory(prisma);
  }

  async index(options?: { 
    page?: number, 
    limit?: number, 
    startDate?: Date,
    endDate?: Date,
    monthId?: number
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: any = {};
    if (options?.startDate && options?.endDate) {
      where.date = {
        gte: options.startDate,
        lte: options.endDate
      };
    }

    if (options?.monthId) {
      where.monthId = options.monthId;
    }

    // Get count for pagination
    const totalCount = await this.prisma.transaction.count({ where });
    
    // Execute query with pagination and filtering
    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            id: true,
            type: true
          } 
        },
        month: {
          select: {
            month: true,
            id: true
          }
        },
      },
      orderBy: {
        date: 'desc'
      },
    });

    // Transform using more direct property access for performance
    const formattedTransactions = transactions.map(transaction => {
      const amountCad = transaction.amountCAD.toNumber();
      const amountUsd = transaction.amountUSD ? transaction.amountUSD.toNumber() : null;
      const categoryName = transaction.category.name;
      const monthName = getMonthName(transaction.month.month);
      
      return {
        ...transaction,
        amount_cad: amountCad,
        amount_usd: amountUsd,
        category: categoryName,
        month: monthName,
        transaction_type: transaction.category.type
      };
    });

    return {
      data: formattedTransactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  }

  async create(data: {
    name: string;
    amount_cad?: number;
    amount_usd?: number;
    date: Date;
    notes?: string;
    userId: string;
    categoryId: number;
  }) {
    // Get the formatted transaction data from factory
    const transactionData = await this.transactionFactory.createTransaction(data);
    // Create the transaction in the database
    try {
      const transaction = await this.prisma.transaction.create({
        data: {
          name: transactionData.name,
          amountCAD: transactionData.amount_cad,
          amountUSD: transactionData.amount_usd ? transactionData.amount_usd : null,
          date: transactionData.date,
          notes: transactionData.notes || null,
          userId: transactionData.userId,
          monthId: transactionData.monthId,
          categoryId: transactionData.categoryId,
        }
      });
      console.log(transaction);

      return transaction;
    } catch (error) {
      console.error('Transaction creation error:', error);
      throw new Error('Failed to create transaction');
    }
  }

  async destroy(id: number) {
    try {
      // Check if the transaction exists
      const transaction = await this.prisma.transaction.findUnique({
        where: { id }
      });

      if (!transaction) {
        throw new Error(`Transaction with ID ${id} not found`);
      }

      // Delete the transaction
      await this.prisma.transaction.delete({
        where: { id }
      });

      return { success: true, message: 'Transaction deleted successfully' };
    } catch (error) {
      console.error('Transaction deletion error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete transaction');
    }
  }

  private async getTotalSpendingByCategory(monthId: number, year: number) {
    const spending = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        monthId,
        month: { year }
      },
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
      ...s,
      categoryName: categories.find(c => c.id === s.categoryId)?.name || ''
    }));
  }

  private async getUSDSpendingByCategory(monthId: number, year: number) {
    return await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        monthId,
        month: { year },
        amountUSD: { not: null }
      },
      _sum: { amountCAD: true }
    });
  }

  private createUSDTotalsMap(usdSpending: any[]) {
    return new Map(
      usdSpending.map(({ categoryId, _sum }) => [
        categoryId,
        _sum.amountCAD || 0
      ])
    );
  }

  private formatCategorySpending(
    spendingData: { categoryId: number; categoryName: string; _sum: { amountCAD: any }; _count: any },
    usdTotalsByCategory: Map<number, number>
  ) {
    const usdTotal = usdTotalsByCategory.get(spendingData.categoryId) || 0;
    const cadOnlyTotal = (Number(spendingData._sum.amountCAD) || 0) - Number(usdTotal);

    return {
      categoryId: spendingData.categoryId,
      categoryName: spendingData.categoryName,
      totalAmountCAD: formatCurrency(cadOnlyTotal),
      totalAmountUSD: formatCurrency(Number(usdTotal)),
      total: cadOnlyTotal + Number(usdTotal)
    };
  }

  async getSpendingByCategory(monthId: number, year: number) {
    const spendingByCategory = await this.getTotalSpendingByCategory(monthId, year);
    const usdSpending = await this.getUSDSpendingByCategory(monthId, year);
    const usdTotalsByCategory = this.createUSDTotalsMap(usdSpending);

    const formattedSpending = spendingByCategory.map(spending => 
      this.formatCategorySpending(spending, usdTotalsByCategory)
    );

    // Sort by total amount in descending order
    return formattedSpending.sort((a, b) => b.total - a.total);
  }
}
