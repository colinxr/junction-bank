"use client"

import { formatCurrency } from "@/lib/utils"
import { useMonthDetail } from "@/app/hooks/useMonths"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

interface MonthSummaryProps {
  monthId: number
  className?: string
}

export function MonthSummaryCard({ monthId, className }: MonthSummaryProps) {
  // Use the hook to fetch month details
  const { monthDetail, isLoading } = useMonthDetail(monthId);

  console.log(monthDetail);

  // Format values when available
  const formattedIncome = monthDetail ? formatCurrency(monthDetail.totalIncome) : null;
  const formattedExpenses = monthDetail ? formatCurrency(monthDetail.totalExpenses) : null;
  const formattedCashflow = monthDetail ? formatCurrency(monthDetail.cashflow) : null;

  return (
    <>
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

      <Card>
        <CardContent>
          <p className="text-md text-xl font-semibold">Spending by Category</p>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {monthDetail?.spendingByCategory?.map((category: { categoryId: number, categoryName: string, totalAmountCAD: string, totalAmountUSD: string }) => (
              <Card key={category.categoryId} className="px-0 py-3 gap-2">
                <CardHeader>
                <CardTitle className="text-lg font-semibold">{category.categoryName}</CardTitle>
                </CardHeader>
                <CardContent> 
                  <p className="font-medium">{category.totalAmountCAD} CAD</p>
                  <p className="font-small text-muted-foreground">{category.totalAmountUSD} USD</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </>

  )
} 