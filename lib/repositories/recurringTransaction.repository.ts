import apiClient from "@/lib/api-client";

// Define interface for recurring transaction data
interface RecurringTransaction {
  id?: number;
  name: string;
  type: "expense" | "income";
  amount_cad?: number;
  amount_usd?: number;
  day_of_month?: number;
  notes?: string;
  categoryId?: number;
}

export const RecurringTransactionRepository = {
  async createRecurringTransaction(transactionData: RecurringTransaction) {
    return apiClient.post("/recurring-transactions", {
      ...transactionData
    });
  },

  async getRecurringTransactions(params = {}) {
    return apiClient.get("/recurring-transactions", { params });
  },

  async getRecurringTransaction(id: string) {
    return apiClient.get(`/recurring-transactions/${id}`);
  },

  async updateRecurringTransaction(id: string, transactionData: Partial<RecurringTransaction>) {
    return apiClient.put(`/recurring-transactions/${id}`, transactionData);
  },

  async deleteRecurringTransaction(id: string) {
    return apiClient.delete(`/recurring-transactions/${id}`);
  }
}; 