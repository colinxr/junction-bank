"use client";

import { useEffect, useState } from "react";
import { MonthDrawerContent } from "./months/components/MonthDrawerContent";
import { Month } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DashboardPage() {
  const [month, setMonth] = useState<Month | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentDate = new Date();
  const formattedDate = format(currentDate, "MMMM d, yyyy");

  useEffect(() => {
    async function fetchLatestMonth() {
      try {
        setLoading(true);
        const response = await fetch("/api/months/latest");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch current month");
        }
        
        const data = await response.json();
        console.log(data);
        
        setMonth(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching latest month:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load current month data";
        setError(errorMessage);
        toast.error("Error", {
          description: errorMessage,
          icon: <AlertCircle className="h-4 w-4" />
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLatestMonth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard - {formattedDate}</h1>
      </div>
      
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      )}
      
      {!loading && !error && month && (
        <MonthDrawerContent resource={month} />
      )}
    </div>
  );
} 