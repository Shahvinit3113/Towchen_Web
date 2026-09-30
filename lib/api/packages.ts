import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { RsaPackage, PackagePurchase } from "@/types";
import { DEFAULT_PACKAGES } from "@/lib/constants";

let mockPurchases: PackagePurchase[] = [
  {
    id: "pur-8801",
    dealerId: "dlr-9941",
    packageId: "pkg-pro-shield",
    packageName: "TowChain Pro Shield Plus",
    vehicleId: "veh-101",
    vehicleRegistration: "DL03CC4482",
    customerName: "Rohan Malhotra",
    customerPhone: "+91 98112 00991",
    amountPaid: 3499,
    commissionEarned: 900,
    status: "active",
    purchasedAt: "2026-08-15T10:35:00Z",
    expiresAt: "2027-08-15T10:35:00Z",
  },
  {
    id: "pur-8802",
    dealerId: "dlr-9941",
    packageId: "pkg-elite-fleet",
    packageName: "TowChain Elite Fleet & Luxury",
    vehicleId: "veh-103",
    vehicleRegistration: "MH01EF2020",
    customerName: "Dr. Ananya Sen",
    customerPhone: "+91 98200 44551",
    amountPaid: 5999,
    commissionEarned: 1600,
    status: "active",
    purchasedAt: "2026-09-12T16:50:00Z",
    expiresAt: "2027-09-12T16:50:00Z",
  },
];

export const packagesApi = {
  getPackages: async (): Promise<RsaPackage[]> => {
    try {
      const res = await api.get<RsaPackage[]>(API_ENDPOINTS.packages.list);
      return Array.isArray(res.data) && res.data.length ? res.data : DEFAULT_PACKAGES;
    } catch {
      return DEFAULT_PACKAGES;
    }
  },

  purchasePackage: async (payload: {
    packageId: string;
    vehicleId: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
  }): Promise<PackagePurchase> => {
    const pkg = DEFAULT_PACKAGES.find((p) => p.id === payload.packageId) || DEFAULT_PACKAGES[1];
    const newPurchase: PackagePurchase = {
      id: `pur-${Date.now().toString().slice(-4)}`,
      dealerId: "dlr-9941",
      packageId: pkg.id,
      packageName: pkg.title,
      vehicleId: payload.vehicleId,
      vehicleRegistration: "REG-" + Math.floor(1000 + Math.random() * 9000),
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      amountPaid: pkg.price,
      commissionEarned: pkg.dealerCommission,
      status: "active",
      purchasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
    };

    try {
      const res = await api.post<PackagePurchase>(
        API_ENDPOINTS.packages.purchase,
        payload
      );
      mockPurchases.unshift(res.data || newPurchase);
      return res.data || newPurchase;
    } catch {
      mockPurchases.unshift(newPurchase);
      return newPurchase;
    }
  },

  getDealerPurchases: async (dealerId?: string): Promise<PackagePurchase[]> => {
    try {
      const res = await api.get<PackagePurchase[]>(
        API_ENDPOINTS.packages.mySubscriptions,
        { params: { dealerId } }
      );
      return Array.isArray(res.data) ? res.data : mockPurchases;
    } catch {
      return mockPurchases;
    }
  },
};
