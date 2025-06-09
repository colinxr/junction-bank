import useSWR from 'swr';
import { useState } from 'react';
import { toast } from 'sonner';
import { Transaction } from '@/app/types';
import apiClient from '@/infrastructure/api-client';

const API_URL = '/api/transactions';

// Fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch transactions');
    error.message = await res.text();
    throw error;
  }
  return res.json();
};

interface TransactionQueryParams {
  monthId?: number;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export function useTransactions(initialParams: TransactionQueryParams = {}) {
  // State for query parameters
  const [queryParams] = useState<TransactionQueryParams>({
    monthId: initialParams.monthId,
  });
  
  // Build query string
  const queryString = new URLSearchParams();
  if (queryParams.monthId) queryString.append('monthId', queryParams.monthId.toString());

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
  
  const getTransactions = async () => {
    const response = await fetch(`${API_URL}?${queryString.toString()}`);
    return response.json();
  };
  
  const createTransaction = async (transactionData: Partial<Transaction>) => {
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
      const response = await apiClient.post("/api/transactions", {
        ...transactionData
      });
      
      // Revalidate the data to get the actual server response
      mutate();
      
      toast.success('Transaction created successfully');
      return response.data;
    } catch (error) {
      // If there was an error, revalidate to restore the correct data
      mutate();
      console.error("Error creating transaction:", error);
      toast.error("Failed to create transaction. Please try again.");
      throw error;
    }
  };
  
  const editTransaction = async (transaction: Partial<Transaction>) => {
    try {
      if (!transaction.id) {
        throw new Error('Transaction ID is required');
      }

      toast.success(`Editing transaction: ${transaction.name}`);
      
      // Create optimistic data update
      const optimisticData = {
        ...data,
        data: data?.data?.map((item: Transaction) => 
          item.id === transaction.id ? { ...item, ...transaction } : item
        ) || [],
      };
      
      // Update the cache optimistically
      mutate(optimisticData, false);
      
      // Use the repository to update the transaction
      await apiClient.put(`/api/transactions/${transaction.id}`, transaction);
      
      // Revalidate to get the server data
      mutate();
      
      toast.success('Transaction updated successfully');
      return transaction;
    } catch (error) {
      console.error("Error editing transaction:", error);
      toast.error("Failed to edit transaction. Please try again.");
      // Revalidate to restore the correct data
      mutate();
      throw error;
    }
  };
  
  const deleteTransaction = async (id: number) => {
    try {
      toast.success(`Deleting transaction ID: ${id}`);
      
      // Optimistically update UI before the API call
      const optimisticData = {
        ...data,
        data: data?.data?.filter((item: Transaction) => item.id !== id) || [],
      };
      
      // Update the cache optimistically
      mutate(optimisticData, false);
      
      // Use the repository to delete the transaction
      await apiClient.delete(`/transactions/${id}`);
      
      // Revalidate to get the server data
      mutate((key: string) => key.startsWith(API_URL));

      toast.success('Transaction deleted successfully');
      return true;
    } catch (error) {
      console.log(error);
      
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction. Please try again.");
      // Revalidate to restore the correct data
      mutate();
      return false;
    }
  };
  
  return {
    transactions: data || [],
    isLoading,
    error,
    createTransaction,
    editTransaction,
    deleteTransaction,
    getTransactions,
    refresh: () => mutate(),
  };
} 