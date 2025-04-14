export interface MonthDTO {
  id: number;
  month: number;
  year: number;
  notes?: string;
  totalIncome: number;
  totalExpenses: number;
  cashflow: number;
  createdAt: Date;
  spendingByCategory?: any;
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