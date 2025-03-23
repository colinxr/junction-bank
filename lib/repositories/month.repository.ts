import apiClient from "@/lib/api-client";
import { Month } from "@/app/types"; // Define your types if not existing

export const MonthRepository = {
  async createMonth(monthData: Partial<Month>) {
    return apiClient.post("/months", {
      ...monthData
    });
  },

  async getMonth() {
    return apiClient.get("/months");
  },

async updateMonth(id: string, monthData: Partial<Month>) {
    return apiClient.put(`/months/${id}`, monthData);
  },

  async deleteMonth(id: string) {
    return apiClient.delete(`/months/${id}`);
  }
};