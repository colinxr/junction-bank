import { PrismaClient } from "@prisma/client";
import { CurrencyService } from "../services/currency.service";

export class TransactionFactory {
  constructor(private prisma: PrismaClient) {}

  async createTransaction(data: {
    name: string;
    amount_cad?: number;
    amount_usd?: number;
    date: Date;
    notes?: string;
    userId: string;
  }) {
    // Handle currency conversion
    let { amount_cad, amount_usd } = data;
    
    if (!amount_cad && amount_usd) {
      // Use the currency service to convert USD to CAD
      amount_cad = await CurrencyService.convertUsdToCad(amount_usd);
    } else if (!amount_cad) {
      throw new Error("Either CAD or USD amount must be provided");
    }

    const transactionDate = new Date(data.date);
    const monthRecord = await this.getMonth(transactionDate);

    return {
      ...data,
      amount_cad,
      amount_usd: amount_usd ? Number(amount_usd.toFixed(2)) : null,
      date: transactionDate,
      monthId: monthRecord.id,
      userId: data.userId,
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