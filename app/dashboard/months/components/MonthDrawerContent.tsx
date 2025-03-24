"use client"

import { Month } from "@/app/types"
import { getMonthName } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { ResourceDrawerContentProps } from "@/components/layout/ResourceDrawer"
import { 
  Card, 
  CardContent 
} from "@/components/ui/card"
import { TransactionsContent } from "@/app/dashboard/transactions/components/TransactionContent"
import { MonthSummaryCard } from "./MonthSummaryCard"

export interface MonthDrawerContentProps extends ResourceDrawerContentProps<Month> {}

export function MonthDrawerContent({ 
  resource: month,
}: MonthDrawerContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <CalendarIcon className="mr-2 h-5 w-5" />
        <h3 className="text-lg font-semibold">{getMonthName(month.month)} {month.year}</h3>
      </div>
      
      {/* Financial Summary */}
      <MonthSummaryCard monthId={month.id} />

      {/* Transactions Section */}
      <Card>
        <CardContent>
          <TransactionsContent month={month} />
        </CardContent>
      </Card>
    </div>
  )
} 