import { PrismaClient } from "@prisma/client";
import { CurrencyService } from "../services/currency.service";

export class RecurringTransactionFactory {
  constructor(private prisma: PrismaClient) {}

  async createRecurringTransaction(data: {
    name: string;
    type: "expense" | "income";
    amount_cad?: number;
    amount_usd?: number;
    day_of_month?: number;
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

    return {
      ...data,
      amount_cad,
      amount_usd: amount_usd ? Number(amount_usd.toFixed(2)) : null,
      day_of_month: data.day_of_month,
      userId: data.userId,
    };
  }
} 