import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { toast } from 'sonner';
import { RecurringTransactionRepository } from '@/lib/repositories/recurringTransaction.repository';

const API_URL = '/api/recurring-transactions';

// Define our recurring transaction type
interface RecurringTransaction {
  id: number;
  name: string;
  type: "expense" | "income";
  amount_cad: number;
  amount_usd?: number;
  day_of_month?: number;
  notes?: string;
  categoryId: number;
  category?: string;
  createdAt: Date;
}

// Fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch recurring transactions');
    error.message = await res.text();
    throw error;
  }
  return res.json();
};

interface RecurringTransactionQueryParams {
  page?: number;
  limit?: number;
}

export function useRecurringTransactions(initialParams: RecurringTransactionQueryParams = {}) {
  // State for query parameters
  const [queryParams, setQueryParams] = useState<RecurringTransactionQueryParams>({
    page: initialParams.page || 1,
    limit: initialParams.limit || 20,
  });
  
  // Build query string
  const queryString = new URLSearchParams();
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.limit) queryString.append('limit', queryParams.limit.toString());

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR(
    `${API_URL}?${queryString.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  // Update query parameters
  const setPage = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  };
  
  const setLimit = (limit: number) => {
    setQueryParams(prev => ({ ...prev, limit }));
  };

  // Method to create a new recurring transaction optimistically
  const createRecurringTransaction = async (transactionData: Partial<RecurringTransaction>) => {
    try {
      // Optimistically update the local data first
      const optimisticData = {
        ...data,
        data: [
          // Add optimistic transaction to the start of the array
          {
            id: 'temp-id-' + Date.now(),
            ...transactionData,
            // Add any default fields needed for rendering
          },
          ...(data?.data || []),
        ],
      };
      
      // Update the cache optimistically and revalidate
      mutate(optimisticData, false);
      
      // Use the repository to create the transaction
      const response = await RecurringTransactionRepository.createRecurringTransaction(transactionData);
      
      // Revalidate the data to get the actual server response
      mutate();
      
      toast.success('Recurring transaction created successfully');
      return response.data;
    } catch (error) {
      // If there was an error, revalidate to restore the correct data
      mutate();
      console.error("Error creating recurring transaction:", error);
      toast.error("Failed to create recurring transaction. Please try again.");
      throw error;
    }
  };
  
  // Method to edit a recurring transaction
  const editRecurringTransaction = async (transaction: RecurringTransaction) => {
    try {
      toast.success(`Editing recurring transaction: ${transaction.name}`);
      
      // Create optimistic data update
      const optimisticData = {
        ...data,
        data: data?.data?.map((item: RecurringTransaction) => 
          item.id === transaction.id ? { ...item, ...transaction } : item
        ) || [],
      };
      
      // Update the cache optimistically
      mutate(optimisticData, false);
      
      // Use the repository to update the transaction
      await RecurringTransactionRepository.updateRecurringTransaction(
        transaction.id.toString(),
        transaction
      );
      
      // Revalidate to get the server data
      mutate();
      
      toast.success('Recurring transaction updated successfully');
      return transaction;
    } catch (error) {
      console.error("Error editing recurring transaction:", error);
      toast.error("Failed to edit recurring transaction. Please try again.");
      // Revalidate to restore the correct data
      mutate();
      throw error;
    }
  };
  
  // Method to delete a recurring transaction
  const deleteRecurringTransaction = async (id: string | number) => {
    try {
      toast.success(`Deleting recurring transaction ID: ${id}`);
      
      // Optimistically update UI before the API call
      const optimisticData = {
        ...data,
        data: data?.data?.filter((item: RecurringTransaction) => item.id !== id) || [],
      };
      
      // Update the cache optimistically
      mutate(optimisticData, false);
      
      // Use the repository to delete the transaction
      await RecurringTransactionRepository.deleteRecurringTransaction(id.toString());
      
      // Revalidate to get the server data
      mutate((key: string) => key.startsWith(API_URL));

      toast.success('Recurring transaction deleted successfully');
      return true;
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
      toast.error("Failed to delete recurring transaction. Please try again.");
      // Revalidate to restore the correct data
      mutate();
      return false;
    }
  };
  
  return {
    recurringTransactions: data?.data || [],
    pagination: data?.pagination || { total: 0, page: 1, pages: 1 },
    isLoading,
    error,
    setPage,
    setLimit,
    createRecurringTransaction,
    editRecurringTransaction,
    deleteRecurringTransaction,
    refresh: () => mutate(),
  };
} 