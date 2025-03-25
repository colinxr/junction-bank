import apiClient from "@/lib/api-client";
import { RecurringTransaction } from "@/app/types";

export const RecurringTransactionRepository = {
  async createRecurringTransaction(transactionData: Partial<RecurringTransaction>) {
    return apiClient.post("/recurring-transactions", {
      ...transactionData
    });
  },

  async getRecurringTransactions(params = {}) {
    return apiClient.get("/recurring-transactions", { params });
  },

  async getRecurringTransaction(id: number) {
    return apiClient.get(`/recurring-transactions/${id}`);
  },

  async updateRecurringTransaction(id: number, transactionData: Partial<RecurringTransaction>) {
    return apiClient.put(`/recurring-transactions/${id}`, transactionData);
  },

  async deleteRecurringTransaction(id: number) {
    return apiClient.delete(`/recurring-transactions/${id}`);
  }
}; 