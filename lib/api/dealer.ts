import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { DealerProfile } from "@/types";

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
