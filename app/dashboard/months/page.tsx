"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { NewMonthModal } from "./components/new-month-modal";
import { MonthsDataTable } from "./components/months-data-table";
import { columns } from "./components/columns";
import { useMonths } from "@/app/hooks/useMonths";

export default function MonthsPage() {
    // Use our custom hook instead of direct SWR usage
    const {
      months,
      isLoading,
      error,
    } = useMonths();
  
    if (error) {
      return <div className="p-8 text-center">Failed to load months. Please try again.</div>;
    }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Months</h1>

        <NewMonthModal />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <MonthsDataTable 
          columns={columns} 
          data={months} 
        />
      )}
    </div>
  );
} 