"use client"

import { useEffect, useState } from "react"
import { Month } from "@/app/types"
import { formatCurrency, getMonthName } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { ResourceDrawerContentProps } from "@/components/layout/resource-drawer"
import { 
  Card, 
  CardContent 
} from "@/components/ui/card"
import { TransactionsContent } from "@/app/dashboard/transactions/components/TransactionContent"
import { useMonths } from "@/app/hooks/useMonths"

export interface MonthDrawerContentProps extends ResourceDrawerContentProps<Month> {}

export function MonthDrawerContent({ 
  resource: month,
}: MonthDrawerContentProps) {
  const { getMonth } = useMonths()
  const [monthData, setMonthData] = useState<Month | null>(null)

  useEffect(() => {
    const fetchMonthData = async () => {
      const data = await getMonth(month.id)
      console.log(data)
      setMonthData(data)
    }
    fetchMonthData()
  }, [])

    return (
    <div className="space-y-6">
      <div className="flex items-center">
        <CalendarIcon className="mr-2 h-5 w-5" />
        <h3 className="text-lg font-semibold">{getMonthName(month.month)} {month.year}</h3>
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="font-medium">{monthData?.totalIncome}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="font-medium">{monthData?.totalExpenses}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Cashflow</p>
              <p className="font-medium">{monthData?.cashflow}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="font-medium">{monthData?.transactionCount}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">notes</p>
              <p className="font-medium text-red-600">{month.notes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TransactionsContent month={month} />
        </CardContent>
      </Card>
    </div>
  )
} 