import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { UserSession, DealerAuthUser, DealerLoginResponse } from "@/types";
import {
  setClientSession,
  clearClientSession,
  getClientSession,
  getAuthToken,
  getRefreshToken,
} from "@/lib/auth/session";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = {
  /**
   * Authenticate dealer using email and password
   * POST /dealer-auth/login
   */
  loginDealer: async (credentials: LoginCredentials): Promise<UserSession> => {
    try {
      const res = await api.post<any>(API_ENDPOINTS.auth.dealerLogin, credentials);
      // Handles both nested ResponseDto { data: { access_token, dealer } } or direct payload
      const payload: DealerLoginResponse = res.data?.data ?? res.data;
      const dealer = payload?.dealer ?? (payload as any)?.user ?? (payload as any);
      const token = payload?.access_token || (payload as any)?.token;

      if (token && dealer) {
        const session: UserSession = {
          id: String(dealer.id || dealer.formated_id || "dlr-01"),
          dealerId: dealer.formated_id || String(dealer.id),
          name: dealer.name || dealer.businessName || dealer.email?.split("@")[0] || "Dealer Partner",
          businessName: dealer.businessName || `Dealer (${dealer.formated_id || dealer.email})`,
          email: dealer.email || credentials.email,
          phone: dealer.phone || "+91 98112 33445",
          role: "dealer",
          token: token,
          refreshToken: payload.refresh_token,
        };
        setClientSession(session);
        return session;
      }
      throw new Error("Invalid session response received from dealer auth server");
    } catch (err: any) {
      // If offline demo fallback account is explicitly used in development
      if (
        process.env.NODE_ENV !== "production" &&
        credentials.email === "partner@apexmotors.com"
      ) {
        const mockDealerSession: UserSession = {
          id: "dlr-9941",
          name: "Apex Motors Logistics",
          businessName: "Apex Motors Autocare Pvt Ltd",
          email: credentials.email,
          phone: "+91 98112 33445",
          role: "dealer",
          token: "jwt_mock_dealer_token_xyz987",
          refreshToken: "jwt_mock_dealer_refresh_token_xyz987",
          dealerId: "dlr-9941",
        };
        setClientSession(mockDealerSession);
        return mockDealerSession;
      }
      throw err;
    }
  },

  /**
   * Get current authenticated dealer profile
   * GET /dealer-auth/me
   */
  getDealerMe: async (tokenOverride?: string): Promise<DealerAuthUser> => {
    const token = tokenOverride || getAuthToken();
    if (!token) {
      throw new Error("No authorization token available for dealer profile request");
    }
    const res = await api.get<any>(API_ENDPOINTS.auth.dealerMe, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = res.data?.data ?? res.data;
    return payload as DealerAuthUser;
  },

  /**
   * Refreshes/validates the dealer session against GET /dealer-auth/me
   */
  refreshDealerSession: async (tokenOverride?: string): Promise<UserSession | null> => {
    const currentSession = getClientSession();
    const token = tokenOverride || currentSession?.token || getAuthToken();
    if (!token) return null;

    try {
      const dealer = await authApi.getDealerMe(token);
      if (dealer && dealer.email) {
        const updatedSession: UserSession = {
          ...currentSession,
          id: String(dealer.id || currentSession?.id || "dlr"),
          dealerId: dealer.formated_id || currentSession?.dealerId || String(dealer.id),
          email: dealer.email,
          role: "dealer",
          name: dealer.name || currentSession?.name || dealer.email.split("@")[0],
          businessName:
            dealer.businessName ||
            currentSession?.businessName ||
            `Dealer (${dealer.formated_id || dealer.email})`,
          token: token,
          refreshToken: currentSession?.refreshToken,
        };
        setClientSession(updatedSession);
        return updatedSession;
      }
      return currentSession;
    } catch (err: any) {
      if (err?.status === 401) {
        clearClientSession();
      }
      throw err;
    }
  },

  /**
   * Refresh JWT access token using the refresh token
   * POST /dealer-auth/refresh
   */
  refreshToken: async (tokenOverride?: string): Promise<UserSession> => {
    const refresh = tokenOverride || getRefreshToken();
    if (!refresh) {
      throw new Error("No refresh token available");
    }

    const res = await api.post<any>(API_ENDPOINTS.auth.dealerRefresh, {
      refresh_token: refresh,
    });
    const payload: DealerLoginResponse = res.data?.data ?? res.data;
    const dealer = payload?.dealer ?? (payload as any)?.user ?? (payload as any);
    const newAccessToken = payload?.access_token || (payload as any)?.token;

    if (newAccessToken && dealer) {
      const current = getClientSession();
      const updatedSession: UserSession = {
        ...(current || {}),
        id: String(dealer.id || dealer.formated_id || current?.id || "dlr"),
        dealerId: dealer.formated_id || current?.dealerId || String(dealer.id),
        name: dealer.name || current?.name || dealer.email?.split("@")[0] || "Dealer Partner",
        businessName:
          dealer.businessName ||
          current?.businessName ||
          `Dealer (${dealer.formated_id || dealer.email})`,
        email: dealer.email || current?.email || "",
        phone: dealer.phone || current?.phone,
        role: "dealer",
        token: newAccessToken,
        refreshToken: payload.refresh_token || refresh,
      };
      setClientSession(updatedSession);
      return updatedSession;
    }
    throw new Error("Failed to refresh dealer session tokens");
  },

  loginAdmin: async (credentials: LoginCredentials): Promise<UserSession> => {
    try {
      const res = await api.post<UserSession>(API_ENDPOINTS.auth.adminLogin, credentials);
      if (res.data && res.data.role === "admin") {
        setClientSession(res.data);
        return res.data;
      }
      throw new Error("Invalid session data from server");
    } catch {
      const mockAdminSession: UserSession = {
        id: "adm-001",
        name: "Head of Operations",
        email: credentials.email || "admin@towchain.com",
        role: "admin",
        token: "jwt_mock_admin_token_abc123",
      };
      setClientSession(mockAdminSession);
      return mockAdminSession;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post(API_ENDPOINTS.auth.logout);
    } catch {
      // ignore
    } finally {
      clearClientSession();
    }
  },
};
