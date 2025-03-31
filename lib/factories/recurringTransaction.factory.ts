import { PrismaClient } from "@prisma/client";
import { CurrencyService } from "../services/currency.service";

export class RecurringTransactionFactory {
  constructor(private prisma: PrismaClient, private currencyService: CurrencyService) {}

  async createRecurringTransaction(data: {
    name: string;
    type: "expense" | "income";
    amountCAD?: number;
    amountUSD?: number;
    day_of_month?: number;
    notes?: string;
    userId: string;
  }) {
    // Handle currency conversion
    let { amountCAD, amountUSD } = data;
    
    if (!amountCAD && amountUSD) {
      // Use the currency service to convert USD to CAD
      amountCAD = await this.currencyService.convertAmount(amountUSD);
    } else if (!amountCAD) {
      throw new Error("Either CAD or USD amount must be provided");
    }

    return {
      ...data,
      amountCAD,
      amountUSD: amountUSD ? Number(amountUSD.toFixed(2)) : null,
      day_of_month: data.day_of_month,
      userId: data.userId,
    };
  }
} 