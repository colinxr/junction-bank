import { ICurrencyConversionService } from './ICurrencyConversionService';
import { Money } from './ValueObjects/Money';

export class CurrencyConversionService implements ICurrencyConversionService {
  // This could use an external API or fixed rates
  async convertCADtoUSD(cadAmount: number): Promise<Money> {
    // Example conversion logic
    const usdAmount = cadAmount * 0.74; // Example rate
    return Money.createUSD(Number(usdAmount.toFixed(2)));
  }
  
  async convertUSDtoCAD(usdAmount: number): Promise<Money> {
    // Example conversion logic
    const cadAmount = usdAmount * 1.35; // Example rate
    return Money.createCAD(Number(cadAmount.toFixed(2)));
  }
} 