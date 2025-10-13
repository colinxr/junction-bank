"use client";

import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { TransactionImportResultDTO } from "@/domains/Transactions/DTOs/TransactionImportDTO";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportSuccessSummaryProps {
  result: TransactionImportResultDTO;
  onReset: () => void;
}

export function ImportSuccessSummary({ result, onReset }: ImportSuccessSummaryProps) {
  const router = useRouter();
  const { successCount, failedCount, totalCount } = result;
  
  const hasErrors = failedCount > 0;
  const successRate = Math.round((successCount / totalCount) * 100);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {successCount > 0 ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
          <CardTitle>Import Summary</CardTitle>
        </div>
        <CardDescription>
          {successCount > 0 
            ? `Successfully imported ${successCount} transactions.`
            : "No transactions were imported."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{successCount}</p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{failedCount}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Success Rate */}
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-xs font-semibold inline-block text-muted-foreground">
                  Success Rate
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold inline-block text-primary">
                  {successRate}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-primary/20">
              <div
                style={{ width: `${successRate}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" onClick={onReset}>
          Import More
        </Button>
        <Button 
          onClick={() => router.push('/dashboard/transactions')}
          disabled={successCount === 0}
        >
          View Transactions <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 