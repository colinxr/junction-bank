import { Money } from '../valueObjects/Money';

export interface ICurrencyConversionService {
  convertCADtoUSD(cadAmount: number): Promise<Money>;
  convertUSDtoCAD(usdAmount: number): Promise<Money>;
} 