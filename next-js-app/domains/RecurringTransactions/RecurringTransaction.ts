export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense'
}

export class RecurringTransaction {
  readonly id?: number;
  readonly clerkId?: string;
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
    clerkId?: string;
    userId?: string; // For backward compatibility
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
    this.clerkId = props.clerkId || props.userId; // Support both fields during migration
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

  public static validateType(type: string): TransactionType {
    if (type === 'Income' || type === TransactionType.INCOME) {
      return TransactionType.INCOME;
    }
    if (type === 'Expense' || type === TransactionType.EXPENSE) {
      return TransactionType.EXPENSE;
    }
    throw new Error(`Invalid transaction type: ${type}. Must be 'Income' or 'Expense'`);
  }

  public static create(props: {
    id?: number;
    clerkId: string;
    userId?: string; // For backward compatibility
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