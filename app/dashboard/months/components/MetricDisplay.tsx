import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricDisplayProps {
  label: string;
  isLoading: boolean;
  value: ReactNode;
  valueClassName?: string;
}

export function MetricDisplay({ 
  label, 
  isLoading, 
  value, 
  valueClassName = "font-medium"
}: MetricDisplayProps) {
  // Format the value if it's a number
  const displayValue = typeof value === 'number' 
    ? `$${value}` 
    : value;
    
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="h-6 w-24" />
      ) : (
        <p className={valueClassName}>{displayValue}</p>
      )}
    </div>
  );
} 