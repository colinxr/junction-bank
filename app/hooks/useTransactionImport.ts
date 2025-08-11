import { useState } from 'react';
import { toast } from 'sonner';
import { 
  TransactionImportDTO, 
  TransactionImportResultDTO, 
  ImportError 
} from '@/domains/Transactions/DTOs/TransactionImportDTO';

interface ImportState {
  step: 'idle' | 'uploading' | 'preview' | 'importing' | 'success' | 'error';
  file: File | null;
  transactions: TransactionImportDTO[];
  errors: ImportError[];
  result: TransactionImportResultDTO | null;
}

export function useTransactionImport() {
  const [state, setState] = useState<ImportState>({
    step: 'idle',
    file: null,
    transactions: [],
    errors: [],
    result: null,
  });

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setState(prev => ({
      ...prev,
      file,
      step: 'idle',
    }));
  };

  // Handle file removal
  const handleFileRemove = () => {
    setState(prev => ({
      ...prev,
      file: null,
      step: 'idle',
      transactions: [],
      errors: [],
    }));
  };

  // Upload file for preview
  const uploadForPreview = async () => {
    if (!state.file) {
      toast.error('Please select a file first');
      return;
    }

    setState(prev => ({ ...prev, step: 'uploading' }));

    try {
      const formData = new FormData();
      formData.append('file', state.file);
      formData.append('preview', 'true');

      const response = await fetch('/api/transactions/import/preview', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to preview transactions');
      }

      setState(prev => ({
        ...prev,
        step: 'preview',
        transactions: data.transactions || [],
        errors: data.errors || [],
      }));

    } catch (error) {
      console.error('Error uploading file for preview:', error);
      toast.error('Failed to preview transactions');
      
      setState(prev => ({
        ...prev,
        step: 'error',
        errors: [{ row: 0, message: error instanceof Error ? error.message : 'Unknown error' }],
      }));
    }
  };

  // Reset state
  const reset = () => {
    setState({
      step: 'idle',
      file: null,
      transactions: [],
      errors: [],
      result: null,
    });
  };

  // Confirm and import transactions
  const confirmImport = async (selectedTransactions: TransactionImportDTO[]) => {
    if (!state.file || selectedTransactions.length === 0) {
      toast.error('No transactions selected for import');
      return;
    }

    setState(prev => ({ ...prev, step: 'importing' }));

    try {
      const formData = new FormData();
      formData.append('file', state.file);
      
      // Add selected transaction IDs to ensure only those are imported
      formData.append('transactionIds', JSON.stringify(
        selectedTransactions.map(t => ({
          name: t.name,
          date: t.date,
          amountCAD: t.amountCAD,
        }))
      ));

      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import transactions');
      }

      setState(prev => ({
        ...prev,
        step: 'success',
        result: {
          successCount: result.successCount || 0,
          failedCount: result.failedCount || 0,
          totalCount: result.totalCount || 0,
          errors: result.errors || [],
          importedTransactions: result.importedTransactions || [],
        },
      }));

      toast.success(`Successfully imported ${result.successCount} transactions`);

    } catch (error) {
      console.error('Error importing transactions:', error);
      toast.error('Failed to import transactions');
      
      setState(prev => ({
        ...prev,
        step: 'error',
        errors: [{ row: 0, message: error instanceof Error ? error.message : 'Unknown error' }],
      }));
    }
  };

  return {
    state,
    handleFileSelect,
    handleFileRemove,
    uploadForPreview,
    confirmImport,
    reset,
  };
} 