import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth headers
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Add request/response interceptors if needed
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        "An unexpected error occurred";
    
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