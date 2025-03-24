import { PrismaClient } from "@prisma/client";

export class RecurringTransactionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async index(options?: { 
    page?: number, 
    limit?: number
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;
    
    // Get count for pagination
    const totalCount = await this.prisma.recurringTransaction.count();
    
    // Execute query with pagination
    const recurringTransactions = await this.prisma.recurringTransaction.findMany({
      include: {
        category: {
          select: {
            name: true,
            id: true
          } 
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Transform data for the client
    const formattedRecurringTransactions = recurringTransactions.map(transaction => {
      const amountCad = transaction.amountCAD.toNumber();
      const amountUsd = transaction.amountUSD ? transaction.amountUSD.toNumber() : null;
      const categoryName = transaction.category.name;
      
      return {
        ...transaction,
        amount_cad: amountCad,
        amount_usd: amountUsd,
        category: categoryName,
        day_of_month: transaction.dayOfMonth
      };
    });

    return {
      data: formattedRecurringTransactions,
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
    type: "expense" | "income";
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

    // Prepare data for creation
    try {
      const transaction = await this.prisma.recurringTransaction.create({
        data: {
          name: data.name,
          type: data.type,
          amountCAD: data.amount_cad || 0,
          amountUSD: data.amount_usd || null,
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
    type?: "expense" | "income";
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
          type: data.type,
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
      const recurringTransactions = await this.prisma.recurringTransaction.findMany();
      
      if (recurringTransactions.length === 0) {
        return { applied: 0 };
      }

      // For each recurring transaction, create a regular transaction for the month
      const createdTransactions = [];
      
      for (const recurringTx of recurringTransactions) {
        // Calculate the date for the transaction
        const day = recurringTx.dayOfMonth || 1; // Default to the 1st if not specified
        const date = new Date(year, month - 1, day);
        
        // Create a regular transaction from the recurring template
        const transaction = await this.prisma.transaction.create({
          data: {
            name: recurringTx.name,
            type: recurringTx.type,
            amountCAD: recurringTx.amountCAD,
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
} 