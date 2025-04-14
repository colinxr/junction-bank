export interface TransactionDTO {
  name: string;
  amountCAD: number;
  amountUSD?: number;
  categoryId: number;
  categoryName?: string;
  notes?: string;
  type: string;
  date: string;
}

export interface TransactionCreateDTO {
  userId: string;
  name: string;
  amountCAD: number;
  amountUSD?: number;
  categoryId: number;
  notes?: string;
  type: string;
  date: string;
  monthId: number;
}

export interface UpdateTransactionDTO {
  name?: string;
  amountCAD?: number;
  amountUSD?: number | null;
  categoryId?: number;
  notes?: string | null;
  type?: string;
}

export interface TransactionListResponseDTO {
  data: TransactionDTO[];
  pagination: {
    total: number;
  };
}

export interface CategorySpendingDTO {
  categoryId: number;
  categoryName: string;
  totalSpent: number;
  transactionCount: number;
} 