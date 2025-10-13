export interface MonthDTO {
  id: number;
  month: number;
  year: number;
  notes?: string;
  totalIncome: number;
  totalExpenses: number;
  recurringExpenses: number;
  nonRecurringExpenses: number;
  cashflow: number;
  createdAt?: Date;
  spendingByCategory?: any;
  projectedDailyBudget: number;
  remainingDailyBudget: number;
  actualDailySpend: number;
  totalDaysInMonth: number;
  daysLeft: number;
  daysPassed: number;
  isCurrentMonth: boolean;
  isInPast: boolean;
  isInFuture: boolean;
}

export interface CreateMonthDTO {
  month: number;
  year: number;
  notes?: string;
}

export interface UpdateMonthDTO {
  month?: number;
  year?: number;
  notes?: string | null;
}

export interface MonthListResponseDTO {
  data: MonthDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
} 