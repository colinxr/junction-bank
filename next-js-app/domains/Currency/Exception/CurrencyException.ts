export class CurrencyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ExchangeRateFetchException extends CurrencyException {
  constructor(message: string = "Failed to fetch exchange rate") {
    super(message);
  }
}

export class InvalidAmountException extends CurrencyException {
  constructor(message: string = "Invalid amount provided") {
    super(message);
  }
}

export class StaleExchangeRateException extends CurrencyException {
  constructor(message: string = "Exchange rate is stale") {
    super(message);
  }
} 