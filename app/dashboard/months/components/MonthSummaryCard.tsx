"use client"

import { formatCurrency } from "@/lib/utils"
import { useMonthDetail } from "@/app/hooks/useMonths"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Card, 
  CardContent 
} from "@/components/ui/card"

interface MonthSummaryProps {
  monthId: number
  className?: string
}

export function MonthSummaryCard({ monthId, className }: MonthSummaryProps) {
  // Use the hook to fetch month details
  const { monthDetail, error, isLoading } = useMonthDetail(monthId);

  // Format values when available
  const formattedIncome = monthDetail ? formatCurrency(monthDetail.totalIncome) : null;
  const formattedExpenses = monthDetail ? formatCurrency(monthDetail.totalExpenses) : null;
  const formattedCashflow = monthDetail ? formatCurrency(monthDetail.cashflow) : null;

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Income</p>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="font-medium text-green-600">{formattedIncome}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="font-medium text-red-600">{formattedExpenses}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Cashflow</p>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className={`font-medium ${monthDetail?.cashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formattedCashflow}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Transactions</p>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="font-medium">{monthDetail?.transactionCount}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="font-medium">{monthDetail?.notes}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 