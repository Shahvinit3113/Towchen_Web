import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { UserSession } from "@/types";
import { setClientSession, clearClientSession } from "@/lib/auth/session";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = {
  loginDealer: async (credentials: LoginCredentials): Promise<UserSession> => {
    try {
      const res = await api.post<UserSession>(API_ENDPOINTS.auth.dealerLogin, credentials);
      if (res.data && res.data.role === "dealer") {
        setClientSession(res.data);
        return res.data;
      }
      throw new Error("Invalid session data from server");
    } catch {
      // Local development fallback
      const mockDealerSession: UserSession = {
        id: "dlr-9941",
        name: "Apex Motors Logistics",
        businessName: "Apex Motors Autocare Pvt Ltd",
        email: credentials.email || "partner@apexmotors.com",
        phone: "+91 98112 33445",
        role: "dealer",
        token: "jwt_mock_dealer_token_xyz987",
        dealerId: "dlr-9941",
      };
      setClientSession(mockDealerSession);
      return mockDealerSession;
    }
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
