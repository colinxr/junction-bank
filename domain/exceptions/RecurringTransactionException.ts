import { DomainException } from './DomainException';

export class InvalidAmountException extends DomainException {
  constructor(amount: number) {
    super(`Transaction amount must be greater than 0, got: ${amount}`);
  }
}

export class InvalidDayOfMonthException extends DomainException {
  constructor(dayOfMonth: number) {
    super(`Day of month must be between 1 and 31, got: ${dayOfMonth}`);
  }
}

export class RecurringTransactionNotFoundException extends DomainException {
  constructor(id: number) {
    super(`Recurring transaction with ID ${id} not found`);
  }
}

export class RecurringTransactionAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super(`Recurring transaction with name "${name}" already exists`);
  }
}

export class InvalidCategoryException extends DomainException {
  constructor(categoryId: number) {
    super(`Invalid category ID: ${categoryId}`);
  }
} 