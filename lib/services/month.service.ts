import { PrismaClient } from "@prisma/client";
import { RecurringTransactionService } from "./recurringTransaction.service";

export class MonthService {
  private prisma: PrismaClient;
  private recurringTransactionService: RecurringTransactionService;

  constructor(prisma: PrismaClient) {
    // Use the shared prisma client with middleware
    this.prisma = prisma;
    this.recurringTransactionService = new RecurringTransactionService(prisma);
  }

  async index(options?: { 
    page?: number, 
    limit?: number,
    year?: number
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: any = {};
    if (options?.year) {
      where.year = options.year;
    }

    // Get count for pagination
    const totalCount = await this.prisma.month.count({ where });
    
    // Execute query with pagination and filtering
    const months = await this.prisma.month.findMany({
      where,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ],
      skip,
      take: limit,
      include: {
        transactions: {
          select: {
            id: true
          }
        }
      }
    });

    // Format the data for the client
    const formattedMonths = months.map(month => {
      return {
        id: month.id,
        month: month.month,
        year: month.year,
        notes: month.notes,
        transactionCount: month.transactions.length || 0
      };
    });

    return {
      data: formattedMonths,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  }

  async show(id: string | number) {
    const monthId = typeof id === 'string' ? parseInt(id, 10) : id;

    const month = await this.prisma.month.findUnique({
      where: { id: monthId }
    });
    
    if (!month) {
      return null;
    }
    
    // Return the month with the pre-calculated totals
    return {
      ...month,
      cashflow: parseFloat(month.totalIncome.toString()) - parseFloat(month.totalExpenses.toString())
    };
  }

  async showByDate(date: Date) {
    const month = date.getMonth() + 1; // JavaScript months are 0-based
    const year = date.getFullYear();

    const monthRecord = await this.prisma.month.findFirst({
      where: { month, year },
    });

    return monthRecord;
  }

  async create(data: {
    month: number;
    year: number;
    notes?: string;
  }) {
    try {
      // Check if month already exists
      const existingMonth = await this.prisma.month.findFirst({
        where: {
          month: data.month,
          year: data.year
        }
      });

      if (existingMonth) {
        throw new Error(`Month ${data.month}/${data.year} already exists`);
      }

      // Create the month in the database
      const month = await this.prisma.month.create({
        data: {
          month: data.month,
          year: data.year,
          notes: data.notes || null
        }
      });

      // Apply recurring transactions to the newly created month
      try {
        await this.recurringTransactionService.applyRecurringTransactionsToMonth(
          month.id,
          data.month,
          data.year
        );
        console.log(`Applied recurring transactions to month ${data.month}/${data.year}`);
      } catch (error) {
        console.error('Error applying recurring transactions:', error);
        // Continue even if recurring transactions fail - the month is still created
      }

      return month;
    } catch (error) {
      console.error('Month creation error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create month');
    }
  }

  async edit(id: string | number, data: {
    month?: number;
    year?: number;
    notes?: string | null;
  }) {
    try {
      const monthId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Check if the month exists
      const month = await this.prisma.month.findUnique({
        where: { id: monthId }
      });

      if (!month) {
        throw new Error(`Month with ID ${id} not found`);
      }

      // If month or year are changing, check for conflicts
      if ((data.month && data.month !== month.month) || 
          (data.year && data.year !== month.year)) {
        const existingMonth = await this.prisma.month.findFirst({
          where: {
            month: data.month || month.month,
            year: data.year || month.year,
            NOT: {
              id: monthId
            }
          }
        });

        if (existingMonth) {
          throw new Error(`Month ${data.month || month.month}/${data.year || month.year} already exists`);
        }
      }

      // Update the month
      const updatedMonth = await this.prisma.month.update({
        where: { id: monthId },
        data: {
          month: data.month || month.month,
          year: data.year || month.year,
          notes: data.notes !== undefined ? data.notes : month.notes
        }
      });

      return updatedMonth;
    } catch (error) {
      console.error('Month update error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update month');
    }
  }

  async destroy(id: string | number) {
    try {
      const monthId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Check if the month exists
      const month = await this.prisma.month.findUnique({
        where: { id: monthId },
        include: {
          transactions: {
            select: { id: true }
          }
        }
      });

      if (!month) {
        throw new Error(`Month with ID ${id} not found`);
      }

      // Check if there are transactions associated with this month
      if (month.transactions.length > 0) {
        throw new Error(`Cannot delete month with ${month.transactions.length} associated transactions`);
      }

      // Delete the month
      await this.prisma.month.delete({
        where: { id: monthId }
      });

      return { success: true, message: 'Month deleted successfully' };
    } catch (error) {
      console.error('Month deletion error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete month');
    }
  }

  getMonthName(month: number) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[month - 1];
  }
}
