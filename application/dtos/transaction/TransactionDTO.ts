export interface TransactionDTO {
  id: number;
  userId: string;
  name: string;
  amountCAD: number;
  amountUSD?: number;
  categoryId: number;
  categoryName?: string;
  notes?: string;
  type: string;
  createdAt?: string;
}

export interface CreateTransactionDTO {
  userId: string;
  name: string;
  amountCAD: number;
  amountUSD?: number;
  categoryId: number;
  notes?: string;
  type?: string;
  date: Date;
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