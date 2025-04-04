import { InvalidMonthNumberException, InvalidYearException } from '../exceptions/MonthException';

export class Month {
  readonly id?: number;
  readonly month: number;
  readonly year: number;
  readonly notes?: string;
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly createdAt?: Date;

  constructor(props: {
    id?: number;
    month: number;
    year: number;
    notes?: string;
    totalIncome?: number;
    totalExpenses?: number;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.month = props.month;
    this.year = props.year;
    this.notes = props.notes;
    this.totalIncome = props.totalIncome || 0;
    this.totalExpenses = props.totalExpenses || 0;
    this.createdAt = props.createdAt;

    this.validate();
  }

  private validate(): void {
    if (this.month < 1 || this.month > 12) {
      throw new InvalidMonthNumberException(this.month);
    }

    if (this.year < 1900 || this.year > 2100) {
      throw new InvalidYearException(this.year);
    }
  }

  public static create(props: {
    id?: number;
    month: number;
    year: number;
    notes?: string;
    totalIncome?: number;
    totalExpenses?: number;
    createdAt?: Date;
  }): Month {
    return new Month(props);
  }

  public getCashflow(): number {
    return this.totalIncome - this.totalExpenses;
  }

  public getMonthName(): string {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[this.month - 1];
  }
} 