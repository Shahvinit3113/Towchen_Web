import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { DealerProfile, PayoutRequest, WalletTransaction } from "@/types";

let mockAdminDealers: (DealerProfile & { activeVehicles: number; totalSold: number; status: "active" | "pending_approval" | "suspended" })[] = [
  {
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
    activeVehicles: 48,
    totalSold: 39,
    status: "active",
    bankDetails: {
      accountHolderName: "Apex Motors Autocare Pvt Ltd",
      accountNumber: "918020038891234",
      ifscOrRouting: "HDFC0001234",
      bankName: "HDFC Bank Ltd",
    },
  },
  {
    id: "dlr-9942",
    businessName: "Velocity Auto Hub Mumbai",
    contactPerson: "Aditya Deshmukh",
    email: "contact@velocityhub.in",
    phone: "+91 98200 88771",
    address: "Link Road, Andheri West",
    city: "Mumbai, Maharashtra",
    gstinOrTaxId: "27BBBCA5566G1Z2",
    isVerified: true,
    commissionTier: "platinum",
    activeVehicles: 112,
    totalSold: 88,
    status: "active",
    bankDetails: {
      accountHolderName: "Velocity Auto Hub LLP",
      accountNumber: "50200012998811",
      ifscOrRouting: "ICIC0005020",
      bankName: "ICICI Bank",
    },
  },
  {
    id: "dlr-9943",
    businessName: "Silverline Prestige Motors",
    contactPerson: "Kavita Rao",
    email: "ops@silverlineprestige.com",
    phone: "+91 99001 22334",
    address: "Lavelle Road",
    city: "Bengaluru, Karnataka",
    gstinOrTaxId: "29CCCCA7788H1Z1",
    isVerified: false,
    commissionTier: "standard",
    activeVehicles: 12,
    totalSold: 5,
    status: "pending_approval",
    bankDetails: {
      accountHolderName: "Silverline Prestige Motors",
      accountNumber: "0012993881273",
      ifscOrRouting: "SBIN0001299",
      bankName: "State Bank of India",
    },
  },
];

export const adminApi = {
  getStats: async () => {
    try {
      const res = await api.get<any>(API_ENDPOINTS.admin.stats);
      return res.data;
    } catch {
      return {
        totalDealers: 142,
        activeProtectedVehicles: 3410,
        monthlyGrossRevenue: 4890000,
        pendingPayoutRequests: 8,
        pendingDealerApprovals: 4,
        avgResponseMinutes: 14.8,
      };
    }
  },

  getAllDealers: async () => {
    try {
      const res = await api.get<any[]>(API_ENDPOINTS.admin.dealers);
      return Array.isArray(res.data) ? res.data : mockAdminDealers;
    } catch {
      return mockAdminDealers;
    }
  },

  approveDealer: async (dealerId: string) => {
    try {
      const res = await api.post(API_ENDPOINTS.admin.approveDealer(dealerId));
      return res.data;
    } catch {
      const dealer = mockAdminDealers.find((d) => d.id === dealerId);
      if (dealer) {
        dealer.status = "active";
        dealer.isVerified = true;
      }
      return { success: true };
    }
  },

  resolvePayout: async (payoutId: string, status: "completed" | "rejected") => {
    try {
      const res = await api.post(API_ENDPOINTS.admin.resolvePayout(payoutId), {
        status,
      });
      return res.data;
    } catch {
      return { success: true, status };
    }
  },
};
