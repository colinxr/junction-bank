import { InvalidMonthNumberException, InvalidYearException } from './MonthException';

export class Month {
  readonly id?: number;
  readonly month: number;
  readonly year: number;
  readonly notes?: string;
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly recurringExpenses: number;
  readonly createdAt?: Date;

  constructor(props: {
    id?: number;
    month: number;
    year: number;
    notes?: string;
    totalIncome?: number;
    totalExpenses?: number;
    recurringExpenses?: number;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.month = props.month;
    this.year = props.year;
    this.notes = props.notes;
    this.totalIncome = props.totalIncome || 0;
    this.totalExpenses = props.totalExpenses || 0;
    this.recurringExpenses = props.recurringExpenses || 0;
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
    recurringExpenses?: number;
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

  // Date helper methods
  public getTotalDaysInMonth(): number {
    // Get the number of days in the month
    return new Date(this.year, this.month, 0).getDate();
  }

  public getDaysLeftInMonth(): number {
    const today = new Date();
    
    // If this month is in the past or future, handle accordingly
    if (!this.isCurrentMonth()) {
      return this.isInFuture() ? this.getTotalDaysInMonth() : 0;
    }
    
    // For current month, calculate days remaining
    const lastDayOfMonth = new Date(this.year, this.month, 0).getDate();
    const currentDay = today.getDate();
    return Math.max(0, lastDayOfMonth - currentDay);
  }

  public getDaysPassedInMonth(): number {
    const today = new Date();
    
    // If this month is in the past or future, handle accordingly
    if (!this.isCurrentMonth()) {
      return this.isInPast() ? this.getTotalDaysInMonth() : 0;
    }
    
    // For current month, return current day
    return today.getDate();
  }

  public isCurrentMonth(): boolean {
    const today = new Date();
    return today.getMonth() + 1 === this.month && today.getFullYear() === this.year;
  }

  public isInPast(): boolean {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    return (this.year < currentYear) || 
           (this.year === currentYear && this.month < currentMonth);
  }

  public isInFuture(): boolean {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    return (this.year > currentYear) || 
           (this.year === currentYear && this.month > currentMonth);
  }

  public belongsToDate(date: Date): boolean {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return this.month === month && this.year === year;
  }

  // Get non-recurring expenses (total expenses minus recurring ones)
  public getNonRecurringExpenses(): number {
    return this.totalExpenses - this.recurringExpenses;
  }

  // Financial calculation methods
  public getDailyBudget(): number {
    // Remaining cashflow divided by days left in the month
    const daysLeft = this.getDaysLeftInMonth();
    
    // If no days left or not current month, return 0
    if (daysLeft === 0) return 0;
    
    return this.getCashflow() / daysLeft;
  }

  public getDailySpendRate(): number {
    // Non-recurring expenses divided by days elapsed in the month so far
    const daysPassed = this.getDaysPassedInMonth();
    
    // If no days passed, return 0 to avoid division by zero
    if (daysPassed === 0) return 0;
    
    return this.getNonRecurringExpenses() / daysPassed;
  }

  public getAverageDailySpend(): number {
    // Non-recurring expenses divided by total days in the month
    const totalDays = this.getTotalDaysInMonth();
    return this.getNonRecurringExpenses() / totalDays;
  }
} 