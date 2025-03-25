import apiClient from "@/lib/api-client";
import { Month } from "@/app/types"; // Define your types if not existing

export const MonthRepository = {
  async createMonth(monthData: Partial<Month>) {
    return apiClient.post("/months", {
      ...monthData
    });
  },

  async getMonths() {
    return apiClient.get("/months");
  },

  async getMonth(id: number) {
    return apiClient.get(`/months/${id}`);
  },

  async updateMonth(id: number, monthData: Partial<Month>) {
    return apiClient.put(`/months/${id}`, monthData);
  },

  async deleteMonth(id: number) {
    return apiClient.delete(`/months/${id}`);
  }
};