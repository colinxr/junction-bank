import apiClient from "@/lib/api-client";
import { Transaction } from "@/app/types"; // Define your types if not existing

export const TransactionService = {
  async createTransaction(transactionData: Omit<Transaction, "id">) {
    return apiClient.post("/transactions", {
      ...transactionData,
      date: new Date(transactionData.date).toISOString()
    });
  },

  async getTransactions() {
    return apiClient.get("/transactions");
  },

  async updateTransaction(id: string, transactionData: Partial<Transaction>) {
    return apiClient.put(`/transactions/${id}`, transactionData);
  },

  async deleteTransaction(id: string) {
    return apiClient.delete(`/transactions/${id}`);
  }
};