import { TransactionType } from '../Entities/Transaction';

/**
 * Represents a raw CSV record before validation and mapping
 */
export interface TransactionCSVRecord {
  date: string;
  name: string;
  amount_cad: string;
  amount_usd?: string;
  category_id?: string;
  notes?: string;
  type?: string;
}

/**
 * Represents a validated transaction ready for import
 */
export interface TransactionImportDTO {
  clerkId: string;
  name: string;
  amountCAD?: number | null;
  amountUSD?: number | null;
  categoryId: number;
  notes?: string | null;
  type: TransactionType;
  date: Date;
  monthId: number;
}

/**
 * Result of transaction import process
 */
export interface TransactionImportResultDTO {
  successCount: number;
  failedCount: number;
  totalCount: number;
  errors?: ImportError[];
  importedTransactions?: TransactionImportDTO[];
}

/**
 * Error details for failed imports
 */
export interface ImportError {
  row?: number;
  message: string;
  originalData?: TransactionCSVRecord;
} 