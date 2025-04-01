import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { toast } from 'sonner';
import { Month } from '@/app/types';
import { MonthRepository } from '@/lib/repositories/month.repository';

const API_URL = '/api/months';

// Fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch months');
    error.message = await res.text();
    throw error;
  }
  return res.json();
};

// Hook for fetching a single month with financial details
export function useMonthDetail(id: number) {

  const { data, error, isLoading } = useSWR(`${API_URL}/${id}`, fetcher, {
    revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );
  
  return {
    monthDetail: data,
    error,
    isLoading,
  };
}

interface MonthQueryParams {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export function useMonths(initialParams: MonthQueryParams = {}) {
  // State for query parameters
  const [queryParams, setQueryParams] = useState<MonthQueryParams>({
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
  const createMonth = async (monthData: Partial<Month>) => {
    try {
      // Optimistically update the local data first
      const optimisticData = {
        ...data,
        data: [
          // Add optimistic transaction to the start of the array
          {
            id: 'temp-id-' + Date.now(),
            ...monthData,
            // Add any default fields needed for rendering
          },
          ...(data?.data || []),
        ],
      };
      
      // Update the cache optimistically and revalidate
      mutate(optimisticData, false);
      
      // Use the repository to create the transaction
      const response = await MonthRepository.createMonth(monthData);
      
      // Revalidate the data to get the actual server response
      mutate();
      
      toast.success('Month created successfully');
      return response.data;
    } catch (error) {
      // If there was an error, revalidate to restore the correct data
      mutate();
      console.error("Error creating month:", error);
      toast.error("Failed to create month. Please try again.");
      throw error;
    }
  };
  
  // Method to edit a month
  const editMonth = async (month: Month) => {
    try {
      toast.success(`Editing month: ${month.month} ${month.year}`);
      
      // Create optimistic data update
      const optimisticData = {
        ...data,
        data: data?.data?.map((item: Month) => 
          item.id === month.id ? { ...item, ...month } : item
        ) || [],
      };
      
      // Update the cache optimistically
      mutate(optimisticData, false);
      
      // Use the repository to update the month
      await MonthRepository.updateMonth(month.id, month);
      
      // Revalidate to get the server data
      mutate();
      
      // Also invalidate the specific month detail if it exists in cache
      mutate(`${API_URL}/${month.id}`);
      
      toast.success('Month updated successfully');
      return month;
    } catch (error) {
      console.error("Error editing month:", error);
      toast.error("Failed to edit month. Please try again.");
      // Revalidate to restore the correct data
      mutate();
      throw error;
    }
  };
  
  // Method to delete a month
  const deleteMonth = async (id: number) => {
    try {
      toast.success(`Deleting month ID: ${id}`);
      
      // Optimistically update UI before the API call
      const optimisticData = {
        ...data,
        data: data?.data?.filter((item: Month) => item.id !== id) || [],
      };
      
      // Update the cache optimistically
      mutate(optimisticData, false);
      
      // Use the repository to delete the month
      await MonthRepository.deleteMonth(id);
      
      // Revalidate to get the server data
      mutate((key: string) => key.startsWith(API_URL));

      toast.success('Month deleted successfully');
      return true;
    } catch (error) {
      console.error("Error deleting month:", error);
      toast.error("Failed to delete month. Please try again.");
      // Revalidate to restore the correct data
      mutate();
      return false;
    }
  };

  const getMonth = async (id: number) => {
    const response = await MonthRepository.getMonth(id);
    return response.data;
  };
  
  return {
    months: data?.data || [],
    pagination: data?.pagination || { total: 0, page: 1, pages: 1 },
    isLoading,
    error,
    setPage,
    setLimit,
    setDateRange,
    getMonth,
    createMonth,
    editMonth,
    deleteMonth,
    refresh: () => mutate(),
  };
} 