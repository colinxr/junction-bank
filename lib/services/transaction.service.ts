import { TransactionFactory } from "../factories/transaction.factory";
import { PrismaClient } from "@prisma/client";
export class TransactionService {
  private prisma: PrismaClient;
  private transactionFactory: TransactionFactory;

  constructor(prisma: PrismaClient) {
    // Use the shared prisma client with middleware
    this.prisma = prisma;
    this.transactionFactory = new TransactionFactory(prisma);
  }

  async getTransactions(options?: { 
    page?: number, 
    limit?: number, 
    startDate?: Date,
    endDate?: Date
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

    // Get count for pagination
    const totalCount = await this.prisma.transaction.count({ where });
    
    // Execute query with pagination and filtering
    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            id: true
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
      skip,
      take: limit
    });

    // Transform using more direct property access for performance
    const formattedTransactions = transactions.map(transaction => {
      const amountCad = parseFloat(transaction.amountCAD.toString());
      const amountUsd = transaction.amountUSD ? parseFloat(transaction.amountUSD.toString()) : null;
      const categoryName = transaction.category.name;
      const monthName = this.getMonthName(transaction.month.month);
      
      return {
        ...transaction,
        amount_cad: amountCad,
        amount_usd: amountUsd,
        category: categoryName,
        month: monthName,
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

  async createTransaction(data: {
    name: string;
    type: "expense" | "income";
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
          type: transactionData.type,
          amountCAD: transactionData.amount_cad,
          amountUSD: transactionData.amount_usd,
          date: transactionData.date,
          notes: transactionData.notes || null,
          userId: transactionData.userId,
          monthId: transactionData.monthId,
          categoryId: data.categoryId
        }
      });

      return transaction;
    } catch (error) {
      console.error('Transaction creation error:', error);
      throw new Error('Failed to create transaction');
    }
  }

  getMonthName(month: number) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[month - 1];
  }
}
