import axios from "axios";
import { toast } from "sonner";

const baseURL =
  typeof window === "undefined" // Server-side
    ? process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"
    : "/api"; // Client-side requests

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request/response interceptors if needed
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        "An unexpected error occurred";

    console.log(errorMessage);
    
    // Show toast notification for client-side errors
    if (typeof window !== 'undefined') {
      toast.error("Something went wrong", {
        description: errorMessage,
        duration: 3000,
      });
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;