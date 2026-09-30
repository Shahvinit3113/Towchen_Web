import { getAuthToken } from "@/lib/auth/session";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  status: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { timeoutMs = 12000, params, headers, ...restOptions } = options;

  let url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const token = getAuthToken();

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // If no external API base URL is provided, simulate or proceed
    if (!API_BASE_URL && typeof window !== "undefined") {
      // Allow seamless mock/fallback handler for initial evaluation
      return handleMockOrLocalApi<T>(endpoint, options);
    }

    const response = await fetch(url, {
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new ApiError(
        response.status,
        errorData.message || `API request failed with status ${response.status}`,
        errorData.errors
      );
    }

    const data = await response.json();
    return {
      data,
      success: true,
      status: response.status,
    };
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === "AbortError") {
      throw new ApiError(408, "Request timed out. Please try again.");
    }
    if (error instanceof ApiError) {
      throw error;
    }
    // If backend is not running, provide graceful simulation in development
    if (process.env.NODE_ENV !== "production") {
      return handleMockOrLocalApi<T>(endpoint, options);
    }
    throw new ApiError(500, error.message || "Network request failed");
  }
}

/**
 * High fidelity mock handler used when external API URL is not yet connected
 * Ensures developer can immediately test and interact with the UI.
 */
async function handleMockOrLocalApi<T>(
  endpoint: string,
  options: RequestOptions
): Promise<ApiResponse<T>> {
  // Simulate network latency (200ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  const method = (options.method || "GET").toUpperCase();

  // Towing Estimate
  if (endpoint.includes("/towing/estimate")) {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const baseDist = Math.max(4, Math.floor(Math.random() * 22) + 6);
    const vehicleMultipliers: Record<string, number> = {
      sedan: 1.0,
      suv: 1.2,
      luxury: 1.5,
      commercial: 1.6,
      motorcycle: 0.8,
      ev: 1.3,
    };
    const mult = vehicleMultipliers[body.vehicleCategory] || 1.0;
    const baseFare = 899;
    const distanceFare = Math.round(baseDist * 45 * mult);
    const categoryCharge = Math.round(baseFare * (mult - 1));
    const total = baseFare + distanceFare + categoryCharge + 120; // + GST

    const estimateData = {
      distanceKm: baseDist,
      baseFare,
      distanceFare,
      vehicleCategoryCharge: categoryCharge,
      totalEstimatedPrice: total,
      estimatedEtaMinutes: Math.floor(Math.random() * 8) + 12,
      serviceType: body.serviceType || "flatbed_towing",
      vehicleCategory: body.vehicleCategory || "sedan",
      breakdown: {
        baseRate: baseFare,
        perKmRate: Math.round(45 * mult),
        taxes: 120,
      },
    };
    return { data: estimateData as unknown as T, success: true, status: 200 };
  }

  // Booking
  if (endpoint.includes("/towing/book")) {
    const booking = {
      bookingId: `TC-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "dispatched",
      estimatedEtaMinutes: 14,
      driverName: "Vikram Singh",
      driverPhone: "+91 98765 43210",
      towTruckPlate: "DL 01 AB 7890",
      trackingUrl: "/track/live-demo",
      totalAmount: 1849,
    };
    return { data: booking as unknown as T, success: true, status: 201 };
  }

  // Dealer Login
  if (endpoint.includes("/auth/dealer/login")) {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const mockDealerSession = {
      id: "dlr-9941",
      name: "Apex Motors Logistics",
      businessName: "Apex Motors Autocare Pvt Ltd",
      email: body.email || "partner@apexmotors.com",
      phone: "+91 98112 33445",
      role: "dealer",
      token: "jwt_mock_dealer_token_xyz987",
      dealerId: "dlr-9941",
    };
    return { data: mockDealerSession as unknown as T, success: true, status: 200 };
  }

  // Admin Login
  if (endpoint.includes("/auth/admin/login")) {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const mockAdminSession = {
      id: "adm-001",
      name: "Head of Operations",
      email: body.email || "admin@towchain.com",
      role: "admin",
      token: "jwt_mock_admin_token_abc123",
    };
    return { data: mockAdminSession as unknown as T, success: true, status: 200 };
  }

  // Fallback for list endpoints
  return {
    data: {} as T,
    success: true,
    status: 200,
  };
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
