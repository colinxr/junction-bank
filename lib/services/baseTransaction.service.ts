import { PrismaClient } from "@prisma/client";
import { getMonthName } from "../utils";
import { CurrencyService } from "./currency.service";

// Define valid entity names from Prisma schema
type PrismaEntityName = 'transaction' | 'recurringTransaction';

export class BaseTransactionService {
  protected prisma: PrismaClient;
  protected currencyService: CurrencyService;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.currencyService = new CurrencyService();
  }

  protected async getTotalCount(entity: PrismaEntityName, where: any = {}) {
    const model = this.prisma[entity] as unknown as { count: (args: { where: any }) => Promise<number> };
    return await model.count({ where });
  }

  protected async formatTransactions(transactions: any[], type: string) {
    return transactions.map(transaction => {
      const amountCad = transaction.amountCAD.toNumber();
      const amountUsd = transaction.amountUSD ? transaction.amountUSD.toNumber() : null;
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

  protected getPaginationParams(options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  protected formatPaginationResponse(data: any[], totalCount: number, page: number, limit: number) {
    return {
      data,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  }

  protected async handleCurrencyConversion(amountCAD?: number, amountUSD?: number) {
    return await this.currencyService.convertAmount(amountCAD, amountUSD);
  }

protected async handleEntityDestroy(entity: PrismaEntityName, id: number) {
    try {
      // Check if the entity exists
      const model = this.prisma[entity] as any;
      const record = await model.findUnique({
        where: { id }
      });

      if (!record) {
        throw new Error(`${entity} with ID ${id} not found`);
      }

      // Delete the record
      await model.delete({
        where: { id }
      });

      return { success: true, message: `${entity} deleted successfully` };
    } catch (error) {
      console.error(`${entity} deletion error:`, error);
      throw new Error(error instanceof Error ? error.message : `Failed to delete ${entity}`);
    }
  }
} 