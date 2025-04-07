export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: 'CAD' | 'USD'
  ) {}
  
  static createCAD(amount: number): Money {
    return new Money(amount, 'CAD');
  }
  
  static createUSD(amount: number): Money {
    return new Money(amount, 'USD');
  }
} 