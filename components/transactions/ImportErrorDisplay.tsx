"use client";

import { AlertCircle } from "lucide-react";
import { ImportError } from "@/domains/Transactions/TransactionImportDTO";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ImportErrorDisplayProps {
  errors: ImportError[];
  className?: string;
}

export function ImportErrorDisplay({ errors, className }: ImportErrorDisplayProps) {
  if (!errors.length) return null;

  return (
    <div className={className}>
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Import Error{errors.length !== 1 ? 's' : ''}</AlertTitle>
        <AlertDescription>
          {errors.length === 1 
            ? 'There was an error with your import.' 
            : `There were ${errors.length} errors with your import.`
          }
        </AlertDescription>
      </Alert>
      
      <ScrollArea className="h-[200px] rounded-md border">
        <div className="p-4 space-y-2">
          {errors.map((error, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                {error.row > 0 && (
                  <span className="font-medium">Row {error.row}: </span>
                )}
                {error.message}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 