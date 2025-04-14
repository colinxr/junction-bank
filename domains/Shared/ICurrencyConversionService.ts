import { Money } from '@/domains/Shared/ValueObjects/Money';

export interface ICurrencyConversionService {
  convertCADtoUSD(cadAmount: number): Promise<Money>;
  convertUSDtoCAD(usdAmount: number): Promise<Money>;
} 