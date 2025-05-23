import { makeCurrencyActions } from "@/infrastructure/container";
import { InvalidAmountException } from "../Exception/CurrencyException";
import { GetUsdToCadRate } from "../Actions/GetUsdToCadRate";
import { ConvertUsdToCad } from "../Actions/ConvertUsdToCad";

export interface CurrencyAmount {
  amountCAD?: number;
  amountUSD?: number;
}

export class CurrencyService {
  private readonly getUsdToCadRate: GetUsdToCadRate;
  private readonly convertUsdToCad: ConvertUsdToCad;

  constructor() {
    const { getUsdToCadRate, convertUsdToCad } = makeCurrencyActions();
    this.getUsdToCadRate = getUsdToCadRate;
    this.convertUsdToCad = convertUsdToCad;
  }

  /**
   * Processes currency amounts - converts USD to CAD if needed, but doesn't convert CAD to USD
   */
  async processCurrencyAmounts(amountCAD: number | undefined, amountUSD: number | undefined): Promise<CurrencyAmount> {
    // If both amounts are provided, return them as is
    if (amountCAD !== undefined && amountUSD !== undefined) {
      return { amountCAD, amountUSD };
    }
    
    // If only CAD amount is provided, return it without USD conversion
    if (amountCAD !== undefined) {
      return { amountCAD };
    }
    
    // If only USD amount is provided, convert to CAD
    if (amountUSD !== undefined) {
      const rate = await this.getUsdToCadRate.execute();
      const amountCAD = await this.convertUsdToCad.execute(amountUSD, rate);
      
      return { amountCAD, amountUSD };
    }
    
    throw new InvalidAmountException("Either CAD or USD amount must be provided");
  }
} 