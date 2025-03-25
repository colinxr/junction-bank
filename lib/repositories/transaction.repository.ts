import apiClient from "@/lib/api-client";
import { Transaction } from "@/app/types"; // Define your types if not existing

export const TransactionRepository = {
  async createTransaction(transactionData: Partial<Transaction>) {
    return apiClient.post("/transactions", {
      ...transactionData
    });
  },

  async getTransactions() {
    return apiClient.get("/transactions");
  },

  async updateTransaction(id: number, transactionData: Partial<Transaction>) {
    return apiClient.put(`/transactions/${id}`, transactionData);
  },

  async deleteTransaction(id: number) {
    return apiClient.delete(`/transactions/${id}`);
  }
};