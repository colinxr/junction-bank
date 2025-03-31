import { PrismaClient } from "@prisma/client";
import { CurrencyService } from "../services/currency.service";

interface TransactionData {
  name: string;
  amount_cad?: number;
  amount_usd?: number;
  date: Date;
  categoryId: number;
  notes?: string;
  userId: string;
}

export class TransactionFactory {
  constructor(
    private prisma: PrismaClient,
    private currencyService: CurrencyService
  ) {}

  async create(data: TransactionData) {
    const [monthRecord, convertedAmount] = await Promise.all([
      this.getOrCreateMonth(data.date),
      this.currencyService.convertAmount(data.amount_cad, data.amount_usd)
    ]);

    return {
      ...data,
      amountCAD: convertedAmount,
      amountUSD: data.amount_usd ? Number(data.amount_usd.toFixed(2)) : null,
      date: new Date(data.date),
      monthId: monthRecord.id
    };
  }

  private async getOrCreateMonth(transactionDate: Date) {
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    // Try to find existing month
    const monthRecord = await this.prisma.month.findFirst({
      where: { month, year }
    });

    if (monthRecord) {
      return monthRecord;
    }

    // If month doesn't exist, throw error as months should be created through a different process
    throw new Error(`Month ${month}/${year} not found. Please create the month first before creating a transaction.`);
  }
}