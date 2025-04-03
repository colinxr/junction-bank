import { PrismaClient, Prisma } from "@prisma/client";
import { BaseTransactionService } from "./baseTransaction.service";
import { getMonthName } from "../utils";

type RecurringTransaction = {
  amountCAD: Prisma.Decimal;
  amountUSD: Prisma.Decimal | null;
  category: { name: string; type: string };
  month?: { month: number };
  [key: string]: unknown;
}

export class RecurringTransactionService extends BaseTransactionService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async index(options?: { 
    page?: number, 
    limit?: number
  }) {
    
    // Execute query with pagination
    const recurringTransactions = await this.prisma.recurringTransaction.findMany({
      include: {
        category: {
          select: {
            name: true,
            id: true,
            type: true
          } 
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    const formattedRecurringTransactions = await this.formatTransactions(recurringTransactions);
    return this.formatPaginationResponse(formattedRecurringTransactions);
  }

  async create(data: {
    name: string;
    amount_cad?: number;
    amount_usd?: number;
    notes?: string;
    day_of_month?: number;
    userId: string;
    categoryId: number;
  }) {
    // Validate day of month
    if (data.day_of_month && (data.day_of_month < 1 || data.day_of_month > 31)) {
      throw new Error("Day of month must be between 1 and 31");
    }

     const { amount_cad, amount_usd } = data;

    // Prepare data for creation
    try {
      const transaction = await this.prisma.recurringTransaction.create({
        data: {
          name: data.name,
          amountCAD: await this.handleCurrencyConversion(amount_cad, amount_usd),
          amountUSD: amount_usd || null,
          notes: data.notes || null,
          dayOfMonth: data.day_of_month || null,
          userId: data.userId,
          categoryId: data.categoryId
        },
        include: {
          category: true
        }
      });

      return transaction;
    } catch (error) {
      console.error('Recurring transaction creation error:', error);
      throw new Error('Failed to create recurring transaction');
    }
  }

  async show(id: number) {
    try {
      const transaction = await this.prisma.recurringTransaction.findUnique({
        where: { id },
        include: {
          category: true
        }
      });

      if (!transaction) {
        throw new Error(`Recurring transaction with ID ${id} not found`);
      }

      return transaction;
    } catch (error) {
      console.error('Error fetching recurring transaction:', error);
      throw new Error('Failed to fetch recurring transaction');
    }
  }

  async edit(id: number, data: {
    name?: string;
    amount_cad?: number;
    amount_usd?: number;
    notes?: string | null;
    day_of_month?: number | null;
    categoryId?: number;
  }) {
    try {
      // Check if the transaction exists
      const transaction = await this.prisma.recurringTransaction.findUnique({
        where: { id }
      });

      if (!transaction) {
        throw new Error(`Recurring transaction with ID ${id} not found`);
      }

      // Validate day of month if provided
      if (data.day_of_month && (data.day_of_month < 1 || data.day_of_month > 31)) {
        throw new Error("Day of month must be between 1 and 31");
      }

      // Update the transaction
      const updatedTransaction = await this.prisma.recurringTransaction.update({
        where: { id },
        data: {
          name: data.name,
          amountCAD: data.amount_cad,
          amountUSD: data.amount_usd,
          notes: data.notes,
          dayOfMonth: data.day_of_month,
          categoryId: data.categoryId
        },
        include: {
          category: true
        }
      });

      return updatedTransaction;
    } catch (error) {
      console.error('Recurring transaction update error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update recurring transaction');
    }
  }

  async destroy(id: number) {
    try {
      // Check if the transaction exists
      const transaction = await this.prisma.recurringTransaction.findUnique({
        where: { id }
      });

      if (!transaction) {
        throw new Error(`Recurring transaction with ID ${id} not found`);
      }

      // Delete the transaction
      await this.prisma.recurringTransaction.delete({
        where: { id }
      });

      return { success: true, message: 'Recurring transaction deleted successfully' };
    } catch (error) {
      console.error('Recurring transaction deletion error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete recurring transaction');
    }
  }

  async applyRecurringTransactionsToMonth(monthId: number, month: number, year: number) {
    try {
      // Get all recurring transactions
      const recurringTransactions = await this.prisma.recurringTransaction.findMany({
        include: {
          category: true
        }
      });
      
      if (recurringTransactions.length === 0) {
        return { applied: 0 };
      }

      // For each recurring transaction, create a regular transaction for the month
      const createdTransactions = [];
      
      for (const recurringTx of recurringTransactions) {
        // Calculate the date for the transaction
        const day = recurringTx.dayOfMonth || 1; // Default to the 1st if not specified
        const date = new Date(year, month - 1, day);

        const amountCAD = await this.handleCurrencyConversion(recurringTx.amountCAD.toNumber(), recurringTx.amountUSD?.toNumber());
        
        // Create a regular transaction from the recurring template
        // The type will be automatically set by the database trigger based on the category
        const transaction = await this.prisma.transaction.create({
          data: {
            name: recurringTx.name,
            amountCAD: amountCAD,
            amountUSD: recurringTx.amountUSD,
            notes: `Auto-generated from recurring transaction: ${recurringTx.notes || ''}`,
            date: date,
            userId: recurringTx.userId,
            monthId: monthId,
            categoryId: recurringTx.categoryId
          }
        });
        
        createdTransactions.push(transaction);
      }

      return { 
        applied: createdTransactions.length,
        transactions: createdTransactions
      };
    } catch (error) {
      console.error('Error applying recurring transactions:', error);
      throw new Error('Failed to apply recurring transactions to month');
    }
  }

  protected async formatTransactions(transactions: RecurringTransaction[]) {
    return transactions.map(transaction => {
      const amountCad = transaction.amountCAD.toNumber();
      const amountUsd = transaction.amountUSD?.toNumber() || null;
      const categoryName = transaction.category.name;
      const monthName = transaction.month?.month ? getMonthName(transaction.month.month) : undefined;

      return {
        ...transaction,
        amount_cad: amountCad,
        amount_usd: amountUsd,
        category: categoryName,
        month: monthName,
        transaction_type: transaction.category.type
      };
    });
  }
} 