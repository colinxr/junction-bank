export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export class Transaction {
  readonly id?: number;
  readonly userId: string;
  readonly name: string;
  readonly amountCAD: number;
  readonly amountUSD?: number;
  readonly categoryId: number;
  readonly categoryName?: string;
  readonly notes?: string;
  readonly type: TransactionType;
  readonly date?: Date;
  readonly monthId?: number;
  readonly createdAt?: Date;

  constructor(props: {
    id?: number;
    userId: string;
    name: string;
    amountCAD: number;
    amountUSD?: number;
    categoryId: number;
    category?: { name: string };
    categoryName?: string;
    notes?: string;
    type?: TransactionType;
    date?: Date;
    monthId?: number;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.amountCAD = props.amountCAD;
    this.amountUSD = props.amountUSD;
    this.categoryId = props.categoryId;
    this.categoryName = props.categoryName;
    this.notes = props.notes;
    this.type = props.type || TransactionType.EXPENSE;
    this.date = props.date;
    this.monthId = props.monthId;
    this.createdAt = props.createdAt;
  }

  public static create(props: {
    id?: number;
    userId: string;
    name: string;
    amountCAD: number;
    amountUSD?: number;
    categoryId: number;
    categoryName?: string;
    notes?: string;
    type?: TransactionType;
    date?: Date;
    monthId?: number;
    createdAt?: Date;
  }): Transaction {
    return new Transaction(props);
  }
} 