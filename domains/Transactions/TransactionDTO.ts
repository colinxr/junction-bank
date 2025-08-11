import { CoreTransaction } from './types';
import { Transaction } from './Transaction';

export interface TransactionDTO extends Omit<CoreTransaction, 'clerkId' | 'monthId' | 'notes' | 'date'> {
  id: number;                // Required in output
  notes?: string;            // Convert DB null → undefined for API cleanliness
  date: string;             // ISO string for API responses
  categoryName?: string;    // Enriched field
}

export interface TransactionCreateDTO {
  clerkId: string;
  name: string;
  amountCAD?: number;
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

// Mapper functions moved to TransactionMapper.ts
export { toTransactionDTO, toTransactionDTOs } from './TransactionMapper'; 