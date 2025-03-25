import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  } catch (error) {
    return 'Invalid date'
  }
}

  // Helper function to get month name
export function getMonthName(monthNum: number | string) {
  const index = typeof monthNum === 'string' ? parseInt(monthNum) - 1 : monthNum - 1;

  return MONTHS[index] || monthNum;
}

export function getMonthNumber(monthName: string) {
  return MONTHS.indexOf(monthName) + 1 || monthName;
}
