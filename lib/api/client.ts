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
      throw error;
    }
    throw new ApiError(500, error.message || "Network request failed");
  }
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
