import useSWR from 'swr';
import { useState } from 'react';

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
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export function useTransactions(initialParams: TransactionQueryParams = {}) {
  // State for query parameters
  const [queryParams, setQueryParams] = useState<TransactionQueryParams>({
    page: initialParams.page || 1,
    limit: initialParams.limit || 20,
    startDate: initialParams.startDate,
    endDate: initialParams.endDate,
  });
  
  // Build query string
  const queryString = new URLSearchParams();
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.limit) queryString.append('limit', queryParams.limit.toString());
  if (queryParams.startDate) queryString.append('startDate', queryParams.startDate.toISOString());
  if (queryParams.endDate) queryString.append('endDate', queryParams.endDate.toISOString());
  
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
  
  const setDateRange = (startDate?: Date, endDate?: Date) => {
    setQueryParams(prev => ({ ...prev, startDate, endDate }));
  };
  
  // Method to create a new transaction optimistically
  const createTransaction = async (transactionData: any) => {
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
      
      // Send the actual request
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }
      
      // Revalidate the data to get the actual server response
      mutate();
      
      return await response.json();
    } catch (error) {
      // If there was an error, revalidate to restore the correct data
      mutate();
      throw error;
    }
  };
  
  return {
    transactions: data?.data || [],
    pagination: data?.pagination || { total: 0, page: 1, pages: 1 },
    isLoading,
    error,
    setPage,
    setLimit,
    setDateRange,
    createTransaction,
    refresh: () => mutate(),
  };
} 