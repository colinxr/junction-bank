'use client';

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RecurringTransactionsContent } from "./components/RecurringTransactionsContent";

export default function RecurringTransactionsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    }>
      <RecurringTransactionsContent />
    </Suspense>
  );
} 