import useSWR from 'swr';
import { toast } from 'sonner';
import { RecurringTransactionRepository } from '@/lib/repositories/recurringTransaction.repository';
import { RecurringTransaction } from '@/app/types';
import apiClient from '@/lib/api-client';
const API_URL = '/api/transactions/recurring';

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
  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR(
    API_URL,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  console.log(data);
  

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
      const response = await apiClient.post(API_URL, transactionData);
      
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
      await apiClient.put(`${API_URL}/${transaction.id}`, transaction);
      
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
  const deleteRecurringTransaction = async (id: number) => {
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
      await apiClient.delete(`${API_URL}/${id}`);
      
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
    createRecurringTransaction,
    editRecurringTransaction,
    deleteRecurringTransaction,
    refresh: () => mutate(),
  };
} 