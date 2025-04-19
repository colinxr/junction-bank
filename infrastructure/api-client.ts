import axios from "axios";
import { createClient as createClientBrowser } from "@/infrastructure/subpabase/client";
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

// Add request interceptor for auth headers
apiClient.interceptors.request.use(async (config) => {
  // Different auth handling for client and server
  if (typeof window === "undefined") {
    // Server-side: we don't add auth headers as the API routes will
    // rely on the cookie for authentication
    return config;
  } else {
    // Client-side: get the session and add the token
    const supabase = createClientBrowser();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  }
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