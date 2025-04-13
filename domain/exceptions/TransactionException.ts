import { DomainException } from './DomainException';

export class InvalidAmountException extends DomainException {
  constructor(amount: number) {
    super(`Transaction amount must be greater than 0, got: ${amount}`);
  }
}

export class TransactionNotFoundException extends DomainException {
  constructor(id: number) {
    super(`Transaction with ID ${id} not found`);
  }
}

export class InvalidCategoryException extends DomainException {
  constructor(categoryId: number) {
    super(`Invalid category ID: ${categoryId}`);
  }
} 