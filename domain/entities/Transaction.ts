import { InvalidAmountException } from '../exceptions/TransactionException';

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense'
}

export class Transaction {
  readonly id?: number;
  readonly userId?: string;
  readonly name: string;
  readonly amountCAD: number;
  readonly amountUSD?: number;
  readonly categoryId: number;
  readonly notes?: string;
  readonly type: TransactionType;
  readonly createdAt?: Date;

  constructor(props: {
    id?: number;
    userId?: string;
    name: string;
    amountCAD: number;
    amountUSD?: number;
    categoryId: number;
    notes?: string;
    type?: TransactionType;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.amountCAD = props.amountCAD;
    this.amountUSD = props.amountUSD;
    this.categoryId = props.categoryId;
    this.notes = props.notes;
    this.type = props.type || TransactionType.Expense;
    this.createdAt = props.createdAt;

    this.validate();
  }

  private validate(): void {
    if (this.amountCAD <= 0) {
      throw new InvalidAmountException(this.amountCAD);
    }
  }

  public static create(props: {
    id?: number;
    userId: string;
    name: string;
    amountCAD: number;
    amountUSD?: number;
    categoryId: number;
    notes?: string;
    type?: TransactionType;
    createdAt?: Date;
  }): Transaction {
    return new Transaction(props);
  }

  public isIncome(): boolean {
    return this.type === TransactionType.Income;
  }

  public isExpense(): boolean {
    return this.type === TransactionType.Expense;
  }
} 