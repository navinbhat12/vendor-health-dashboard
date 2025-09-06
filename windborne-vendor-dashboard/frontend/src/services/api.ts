import axios from "axios";
import type {
  VendorSummary,
  VendorComparison,
  VendorTrends,
  RefreshResponse,
} from "../types/vendor";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const vendorApi = {
  // Get vendor summary
  getVendorSummary: async (ticker: string): Promise<VendorSummary> => {
    const response = await api.get<VendorSummary>(`/vendors/${ticker}/summary`);
    return response.data;
  },

  // Get vendor trends
  getVendorTrends: async (ticker: string): Promise<VendorTrends> => {
    const response = await api.get<VendorTrends>(`/vendors/${ticker}/trends`);
    return response.data;
  },

  // Get company overview
  getVendorOverview: async (ticker: string): Promise<any> => {
    const response = await api.get(`/vendors/${ticker}/overview`);
    return response.data;
  },

  // Get comparison data for all vendors
  getVendorComparison: async (): Promise<VendorComparison> => {
    const response = await api.get<VendorComparison>("/comparison");
    return response.data;
  },

  // Refresh vendor balance sheet data
  refreshVendorData: async (ticker: string): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>(
      `/vendors/${ticker}/refresh-balance-sheet`
    );
    return response.data;
  },

  // Initialize all target vendors
  initializeVendors: async (): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>("/initialize-vendors");
    return response.data;
  },
};

export const healthApi = {
  // Health check
  healthCheck: async (): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> => {
    const response = await api.get("/health");
    return response.data;
  },
};

export default api;
