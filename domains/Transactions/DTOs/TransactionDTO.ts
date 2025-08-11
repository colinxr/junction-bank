import { CoreTransaction } from '../Validators/types';
import { Transaction } from '../Entities/Transaction';

export interface TransactionDTO extends Omit<CoreTransaction, 'clerkId' | 'monthId' | 'notes' | 'date' | 'type'> {
  id: number;                // Required in output
  notes?: string | null;     // Convert DB null → null for API consistency
  date?: string | null;      // Optional ISO string for API responses
  type: string;              // String representation for API
  categoryName?: string | null;    // Enriched field
}

export interface TransactionCreateDTO {
  clerkId: string;
  name: string;
  amountCAD?: number | null;
  amountUSD?: number | null;
  categoryId: number;
  notes?: string | null;
  type: string;
  date: string;
  monthId: number;
}

export interface UpdateTransactionDTO {
  name?: string | null;
  amountCAD?: number | null;
  amountUSD?: number | null;
  categoryId?: number | null;
  notes?: string | null;
  type?: string | null;
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
export { toTransactionDTO, toTransactionDTOs } from '../Adapters/TransactionMapper'; 