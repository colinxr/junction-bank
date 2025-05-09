export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export class RecurringTransaction {
  readonly id?: number;
  readonly userId?: string;
  readonly name: string;
  readonly amountCAD: number;
  readonly amountUSD?: number;
  readonly categoryId: number;
  readonly notes?: string;
  readonly dayOfMonth?: number;
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
    dayOfMonth?: number;
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
    this.dayOfMonth = props.dayOfMonth;
    this.type = props.type || TransactionType.EXPENSE;
    this.createdAt = props.createdAt;

    this.validate();
  }

  private validate(): void {
    if (this.amountCAD <= 0) {
      throw new Error(`Transaction amount must be greater than 0, got: ${this.amountCAD}`);
    }

    if (this.dayOfMonth !== undefined && (this.dayOfMonth < 1 || this.dayOfMonth > 31)) {
      throw new Error(`Day of month must be between 1 and 31, got: ${this.dayOfMonth}`);
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
    dayOfMonth?: number;
    type?: TransactionType;
    createdAt?: Date;
  }): RecurringTransaction {
    return new RecurringTransaction(props);
  }

  public isIncome(): boolean {
    return this.type === TransactionType.INCOME;
  }

  public isExpense(): boolean {
    return this.type === TransactionType.EXPENSE;
  }
} 