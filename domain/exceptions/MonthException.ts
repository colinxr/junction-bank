import { DomainException } from './DomainException';

export class InvalidMonthNumberException extends DomainException {
  constructor(month: number) {
    super(`Month number must be between 1 and 12, got: ${month}`);
  }
}

export class InvalidYearException extends DomainException {
  constructor(year: number) {
    super(`Year appears to be invalid: ${year}`);
  }
}

export class MonthAlreadyExistsException extends DomainException {
  constructor(month: number, year: number) {
    super(`Month ${month}/${year} already exists`);
  }
}

export class MonthNotFoundException extends DomainException {
  constructor(id: number) {
    super(`Month with ID ${id} not found`);
  }
}

export class MonthHasTransactionsException extends DomainException {
  constructor(id: number, count: number) {
    super(`Cannot delete month with ID ${id} because it has ${count} associated transactions`);
  }
} 