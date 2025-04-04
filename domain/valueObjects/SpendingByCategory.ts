export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  totalAmountCAD: string;
  totalAmountUSD: string;
  total: number;
}

export type SpendingByCategory = CategorySpending[]; 