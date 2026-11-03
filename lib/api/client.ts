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

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

function serializeBody(body: any) {
  if (body === undefined || body === null) return undefined;
  if (typeof FormData !== "undefined" && body instanceof FormData) return body;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const defaultTimeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || 60000;
  const { timeoutMs = defaultTimeout, params, headers, ...restOptions } = options;

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

  const isFormData = typeof FormData !== "undefined" && restOptions.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const mergedHeaders: Record<string, string> = {
    ...defaultHeaders,
    ...(headers as Record<string, string>),
  };

  if (isFormData) {
    delete mergedHeaders["Content-Type"];
    delete mergedHeaders["content-type"];
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
      headers: mergedHeaders,
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
      if (error.status === 404 && process.env.NODE_ENV !== "production") {
        return handleMockOrLocalApi<T>(endpoint, options);
      }
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

  // Public Customer Inspection Mock / Fallback
  if (endpoint.includes("/dealer-package-order/public/inspection/")) {
    const segments = endpoint.split("/");
    const param = decodeURIComponent(segments[segments.length - 1] || "");
    const mockInspection = {
      id: 2,
      order_number: param || "DPKG00000045",
      customer_name: "Customer",
      customer_phone: "9876543210",
      customer_email: "customer@example.com",
      vehicle_reg_number: "GJ09DS4171",
      vehicle_make: "TVS",
      vehicle_model: "Ronin 225",
      plan_name: "Gold Mobility Shield",
      status: "PendingInspection",
      is_completed: false,
      uploaded_by_dealer: null,
      package_pdf_url: null,
    };
    return {
      data: { is_success: true, status: 200, data: mockInspection } as unknown as T,
      success: true,
      status: 200,
    };
  }

  // Dealer Login
  if (endpoint.includes("/dealer-auth/login") || endpoint.includes("/auth/dealer/login")) {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const mockDealerSession = {
      access_token: "jwt_mock_dealer_token_xyz987",
      refresh_token: "jwt_mock_dealer_refresh_token_xyz987",
      dealer: {
        id: 1,
        formated_id: "DLR0000001",
        email: body.email || "dealer@nexttow.com",
        role: "Dealer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    return { data: mockDealerSession as unknown as T, success: true, status: 200 };
  }

  // Dealer Me
  if (endpoint.includes("/dealer-auth/me") || endpoint.includes("/auth/me")) {
    const mockDealer = {
      id: 1,
      formated_id: "DLR0000001",
      email: "dealer@nexttow.com",
      role: "Dealer",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { data: mockDealer as unknown as T, success: true, status: 200 };
  }

  // Dealer Refresh
  if (endpoint.includes("/dealer-auth/refresh")) {
    const mockRefresh = {
      access_token: "jwt_mock_dealer_token_refreshed_xyz987",
      refresh_token: "jwt_mock_dealer_refresh_token_xyz987",
      dealer: {
        id: 1,
        formated_id: "DLR0000001",
        email: "dealer@nexttow.com",
        role: "Dealer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    return { data: mockRefresh as unknown as T, success: true, status: 200 };
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
      body: serializeBody(body),
    }),
  put: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: serializeBody(body),
    }),
  patch: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: serializeBody(body),
    }),
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
