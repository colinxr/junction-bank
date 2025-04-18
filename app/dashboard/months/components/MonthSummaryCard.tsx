"use client"

import { useMonthDetail } from "@/app/hooks/useMonths"
import { Card, CardContent } from "@/components/ui/card"
import { MetricDisplay } from "./MetricDisplay"
import { CategoryCard } from "./CategoryCard"

interface MonthSummaryProps {
  monthId: number
  className?: string
}

interface CategoryData {
  categoryId: number
  categoryName: string
  totalAmountCAD: string
  totalAmountUSD: string
}

export function MonthSummaryCard({ monthId, className }: MonthSummaryProps) {
  // Use the hook to fetch month details
  const { monthDetail, isLoading } = useMonthDetail(monthId);

  console.log(monthDetail);
  
  return (
    <>
      <Card className={className}>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricDisplay 
              label="Total Income"
              isLoading={isLoading}
              value={monthDetail?.formattedIncome}
              valueClassName="font-medium text-green-600"
            />
            
            <MetricDisplay 
              label="Total Expenses"
              isLoading={isLoading}
              value={monthDetail?.formattedExpenses}
              valueClassName="font-medium text-red-600"
            />

            <MetricDisplay 
              label="Cashflow"
              isLoading={isLoading}
              value={monthDetail?.formattedCashflow}
              valueClassName={`font-medium ${monthDetail?.cashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}
            />

            <MetricDisplay 
              label="Transactions"
              isLoading={isLoading}
              value={monthDetail?.transactionCount}
            />

            <MetricDisplay 
              label="Projected Daily Budget"
              isLoading={isLoading}
              value={monthDetail?.formattedProjectedDailyBudget}
            />

            <MetricDisplay 
              label="Remaining Daily Budget"
              isLoading={isLoading}
              value={monthDetail?.formattedRemainingDailyBudget}
            />

            <MetricDisplay 
              label="Actual Daily Spend"
              isLoading={isLoading}
              value={monthDetail?.formattedActualDailySpend}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricDisplay 
              label="Notes"
              isLoading={isLoading}
              value={monthDetail?.notes || "No notes"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-md text-xl font-semibold">Spending by Category</p>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {monthDetail?.spendingByCategory?.map((category: CategoryData) => (
              <CategoryCard
                key={category.categoryId}
                categoryId={category.categoryId}
                categoryName={category.categoryName}
                totalAmountCAD={category.totalAmountCAD}
                totalAmountUSD={category.totalAmountUSD}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
} 