
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

  async getTransactions() {
    const transactions = await this.prisma.transaction.findMany({
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
      }
    });

    // Transform the data - convert Decimal strings to numbers and add month names
    return transactions.map(transaction => ({
      ...transaction,
      amount_cad: parseFloat(transaction.amountCAD.toString()),
      amount_usd: transaction.amountUSD ? parseFloat(transaction.amountUSD.toString()) : null,
      category: transaction.category.name,
      month: this.getMonthName(transaction.month.month),
    }));
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
