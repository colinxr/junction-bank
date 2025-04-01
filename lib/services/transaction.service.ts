import { TransactionFactory } from "../factories/transaction.factory";
import { PrismaClient } from "@prisma/client";
import { formatCurrency } from "../utils";
import { BaseTransactionService } from "./baseTransaction.service";

export class TransactionService extends BaseTransactionService {
  private transactionFactory: TransactionFactory;

  constructor(prisma: PrismaClient) {
    super(prisma);
    this.transactionFactory = new TransactionFactory(prisma, this.currencyService);
  }

  async index(options?: { 
    page?: number, 
    limit?: number, 
    startDate?: Date,
    endDate?: Date,
    monthId?: number
  }) {
    const { page, limit, skip } = this.getPaginationParams(options);
    
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
    const totalCount = await this.getTotalCount('transaction', where);
    
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
      }
    });

    const formattedTransactions = await this.formatTransactions(transactions, 'transaction');
    return this.formatPaginationResponse(formattedTransactions, totalCount, page, limit);
  }

  async create(data: {
    name: string;
    amountCAD?: number;
    amountUSD?: number;
    date: Date;
    notes?: string;
    userId: string;
    categoryId: number;
  }) {
    // Get the formatted transaction data from factory
    const transactionData = await this.transactionFactory.create(data);
    try {
      const transaction = await this.prisma.transaction.create({
        data: {...transactionData}
      });

      return transaction;
    } catch (error) {
      console.error('Transaction creation error:', error);
      throw new Error('Failed to create transaction');
    }
  }

  async destroy(id: number) {
    return await this.handleEntityDestroy('transaction', id);
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
