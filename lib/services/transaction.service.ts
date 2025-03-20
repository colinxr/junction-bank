import { TransactionFactory } from "../factories/transaction.factory";
import { PrismaClient } from "@prisma/client";
export class TransactionService {
  private prisma: PrismaClient;
  private transactionFactory: TransactionFactory;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.transactionFactory = new TransactionFactory(prisma);
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

    console.log(transactionData);
    

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

  async getTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true,
        month: true
      }
    });
  }
}
