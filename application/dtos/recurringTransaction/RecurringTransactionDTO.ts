export interface RecurringTransactionDTO {
  id: number;
  userId: string;
  name: string;
  amountCAD: number;
  amountUSD?: number;
  categoryId: number;
  categoryName?: string;
  notes?: string;
  dayOfMonth?: number;
  type: string;
  createdAt?: string;
}

export interface CreateRecurringTransactionDTO {
  userId: string;
  name: string;
  amountCAD: number;
  amountUSD?: number;
  categoryId: number;
  notes?: string;
  dayOfMonth?: number;
  type?: string;
}

export interface UpdateRecurringTransactionDTO {
  name?: string;
  amountCAD?: number;
  amountUSD?: number | null;
  categoryId?: number;
  notes?: string | null;
  dayOfMonth?: number | null;
  type?: string;
}

export interface RecurringTransactionListResponseDTO {
  data: RecurringTransactionDTO[];
  pagination: {
    total: number;
  };
} 