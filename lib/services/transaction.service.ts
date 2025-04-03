import { TransactionFactory } from "../factories/transaction.factory";
import { PrismaClient, Prisma } from "@prisma/client";
import { formatCurrency, getMonthName } from "../utils";
import { BaseTransactionService } from "./baseTransaction.service";

interface TransactionWhereInput {
  monthId?: number;
}

interface USDSpending {
  categoryId: number;
  _sum: {
    amountCAD: Prisma.Decimal | null;
  };
}

interface CategorySpending {
  categoryId: number;
  categoryName: string;
  _sum: {
    amountCAD: Prisma.Decimal | null;
  };
  _count: {
    amountUSD: number;
  };
}

export class TransactionService extends BaseTransactionService {
  private transactionFactory: TransactionFactory;

  constructor(prisma: PrismaClient) {
    super(prisma);
    this.transactionFactory = new TransactionFactory(prisma, this.currencyService);
  }

  async index(options?: { 
    page?: number, 
    limit?: number, 
    monthId?: number
  }) {
    const { page, limit } = this.getPaginationParams(options);
    
    // Build where clause for filtering
    const where: TransactionWhereInput = {};

    if (options?.monthId) {
      where.monthId = options.monthId;
    }

    // Get count for pagination
    const totalCount = await this.getTotalCount('transaction', where);

    // Get transactions with pagination
    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: true,
        month: true,
      },
      orderBy: {
        date: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format transactions
    const formattedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount_cad: transaction.amountCAD.toNumber(),
      amount_usd: transaction.amountUSD?.toNumber() || null,
      category: transaction.category.name,
      month: transaction.month?.month ? getMonthName(transaction.month.month) : undefined,
      transaction_type: transaction.category.type
    }));

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

  async update(id: number, data: {
    name?: string;
    amountCAD?: number;
    amountUSD?: number;
    date?: Date;
    notes?: string;
    categoryId?: number;
  }) {
    return await this.handleEntityUpdate('transaction', id, data);
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

  private createUSDTotalsMap(usdSpending: USDSpending[]) {
    const usdTotalsByCategory = new Map<number, number>();
    usdSpending.forEach((item) => {
      const amount = item._sum.amountCAD?.toNumber() || 0;
      usdTotalsByCategory.set(item.categoryId, amount);
    });
    return usdTotalsByCategory;
  }

  private formatCategorySpending(
    spendingData: CategorySpending,
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
