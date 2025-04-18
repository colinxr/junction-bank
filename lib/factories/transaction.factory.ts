import { PrismaClient } from "@prisma/client";
import { CurrencyService } from "../services/currency.service";

interface TransactionData {
  name: string;
  amountCAD?: number;
  amountUSD?: number;
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
      this.currencyService.convertAmount(data.amountCAD, data.amountUSD)
    ]);

    return {
      ...data,
      amountCAD: convertedAmount,
      amountUSD: data.amountUSD ? Number(data.amountUSD.toFixed(2)) : null,
      date: new Date(data.date),
      monthId: monthRecord.id
    };
  }

  private async getOrCreateMonth(transactionDate: Date) {
    try {
      // Ensure we have a valid Date object
      const dateObj = transactionDate instanceof Date 
        ? transactionDate 
        : new Date(transactionDate);
        
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();

    const monthRecord = await this.prisma.month.findFirst({
      where: { month, year }
    });
    
    if (monthRecord) {
      return monthRecord;
    }

    const newMonthRecord  = await this.prisma.month.create({
      data: { month, year }
    });

    return newMonthRecord;
    } catch (error) {
      console.error('Error creating month record:', error);
      throw new Error('Failed to create month record');
    }
  }
}