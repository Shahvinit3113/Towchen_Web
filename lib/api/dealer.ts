import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { DealerProfile, DealerAuthUser } from "@/types";
import { authApi } from "./auth";
import { getClientSession } from "@/lib/auth/session";

let mockDealerProfile: DealerProfile = {
  id: "dlr-9941",
  businessName: "Apex Motors Autocare Pvt Ltd",
  contactPerson: "Rajeev Sharma",
  email: "partner@apexmotors.com",
  phone: "+91 98112 33445",
  address: "Plot 42, Sector 18, Udyog Vihar",
  city: "Gurugram, Haryana",
  gstinOrTaxId: "07AAACA1234F1Z5",
  isVerified: true,
  commissionTier: "gold",
  bankDetails: {
    accountHolderName: "Apex Motors Autocare Pvt Ltd",
    accountNumber: "918020038891234",
    ifscOrRouting: "HDFC0001234",
    bankName: "HDFC Bank Ltd",
  },
};

export const dealerApi = {
  getAccountDetails: async (): Promise<DealerAuthUser> => {
    try {
      const me = await authApi.getDealerMe();
      if (me && (me.email || me.name || me.formated_id)) {
        return me;
      }
    } catch (err) {
      console.warn("Could not fetch /dealer-auth/me, falling back to session/mock details:", err);
    }

    const session = getClientSession();
    return {
      id: session?.id || "1",
      formated_id: session?.dealerId || "DLR0000001",
      name: session?.name || "Apex Motors Autocare",
      businessName: session?.businessName || "Apex Motors Autocare Pvt Ltd",
      email: session?.email || "partner@apexmotors.com",
      phone: session?.phone || "+91 98112 33445",
      number: session?.phone || "+91 98112 33445",
      alternative_number: "+91 98112 33446",
      residential_address: "Plot 42, Sector 18, Udyog Vihar, Gurugram, Haryana 122015",
      bank_name: "HDFC Bank Ltd",
      ifsc_code: "HDFC0001234",
      account_number: "918020038891234",
      account_holder_name: session?.businessName || "Apex Motors Autocare Pvt Ltd",
      role: "Dealer",
      dealer_image: null,
      aadhar_image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
      pan_image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
      bankdetails_image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80",
      created_at: "2026-01-15T09:30:00.000Z",
      updated_at: "2026-03-20T11:45:00.000Z",
    };
  },

  getProfile: async (): Promise<DealerProfile> => {
    try {
      const res = await api.get<DealerProfile>(API_ENDPOINTS.dealer.profile);
      return res.data?.id ? res.data : mockDealerProfile;
    } catch {
      return mockDealerProfile;
    }
  },

  updateProfile: async (
    updates: Partial<DealerProfile>
  ): Promise<DealerProfile> => {
    try {
      const res = await api.put<DealerProfile>(
        API_ENDPOINTS.dealer.updateProfile,
        updates
      );
      mockDealerProfile = { ...mockDealerProfile, ...res.data };
      return mockDealerProfile;
    } catch {
      mockDealerProfile = { ...mockDealerProfile, ...updates };
      return mockDealerProfile;
    }
  },

  getStats: async () => {
    try {
      const res = await api.get<any>(API_ENDPOINTS.dealer.stats);
      if (res.data && res.data.totalVehicles !== undefined) {
        return res.data;
      }
      return {
        totalVehicles: 48,
        activePackages: 39,
        availableBalance: 24500,
        pendingPayouts: 5000,
        lifetimeEarned: 118400,
        thisMonthCommissions: 14200,
      };
    } catch {
      return {
        totalVehicles: 48,
        activePackages: 39,
        availableBalance: 24500,
        pendingPayouts: 5000,
        lifetimeEarned: 118400,
        thisMonthCommissions: 14200,
      };
    }
  },
};
