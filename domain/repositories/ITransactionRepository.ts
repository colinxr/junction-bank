export interface ITransactionRepository {
  getTotalSpendingByCategory(monthId: number): Promise<any>;
  getUSDSpendingByCategory(monthId: number): Promise<any>;
} 