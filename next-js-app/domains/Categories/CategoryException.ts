import { DomainException } from '../Shared/DomainException';

export class CategoryNameEmptyException extends DomainException {
  constructor() {
    super('Category name cannot be empty');
  }
}

export class InvalidCategoryTypeException extends DomainException {
  constructor(type: string) {
    super(`Category type must be either 'Income' or 'Expense', got: ${type}`);
  }
}

export class CategoryAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super(`Category with name '${name}' already exists`);
  }
}

export class CategoryNotFoundException extends DomainException {
  constructor(id: number) {
    super(`Category with ID ${id} not found`);
  }
}

export class CategoryHasTransactionsException extends DomainException {
  constructor(id: number, count: number) {
    super(`Cannot delete category with ID ${id} because it has ${count} associated transactions`);
  }
} 