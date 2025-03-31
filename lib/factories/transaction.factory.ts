import { PrismaClient } from "@prisma/client";
import { CurrencyService } from "../services/currency.service";

export class TransactionFactory {
  constructor(private prisma: PrismaClient) {}

  async createTransaction(data: {
    name: string;
    amount_cad?: number;
    amount_usd?: number;
    date: Date;
    categoryId: number;
    notes?: string;
    userId: string;
  }) {
    // Handle currency conversion
    let { amount_cad, amount_usd } = data;
    
    amount_cad = await CurrencyService.convertAmount(amount_cad, amount_usd);

    const transactionDate = new Date(data.date);
    const monthRecord = await this.getMonth(transactionDate);

    return {
      ...data,
      amount_cad,
      amount_usd: amount_usd ? Number(amount_usd.toFixed(2)) : null,
      date: transactionDate,
      monthId: monthRecord.id,
      userId: data.userId,
      categoryId: data.categoryId,
    };
  }

  private async getMonth(transactionDate: Date) {
    const month = transactionDate.getMonth() + 1; // JavaScript months are 0-based
    const year = transactionDate.getFullYear();

    const monthRecord = await this.prisma.month.findFirst({
      where: { month, year },
    });

    if (!monthRecord) {
      throw new Error("Create the month first before creating a transaction");
    }

    return monthRecord;
  }
}