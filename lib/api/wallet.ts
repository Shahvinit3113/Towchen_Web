import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { WalletSummary, WalletTransaction, PayoutRequest } from "@/types";

let mockWalletSummary: WalletSummary = {
  dealerId: "dlr-9941",
  currentBalance: 24500,
  lifetimeEarnings: 118400,
  pendingPayouts: 5000,
  lockedReserve: 2000,
  totalWithdrawn: 88900,
  currency: "INR",
};

let mockTransactions: WalletTransaction[] = [
  {
    id: "txn-9912",
    dealerId: "dlr-9941",
    type: "commission_credit",
    amount: 1600,
    status: "settled",
    referenceId: "PUR-8802",
    description: "Commission for Elite Fleet Package (MH01EF2020)",
    createdAt: "2026-09-12T16:50:00Z",
  },
  {
    id: "txn-9911",
    dealerId: "dlr-9941",
    type: "commission_credit",
    amount: 900,
    status: "settled",
    referenceId: "PUR-8801",
    description: "Commission for Pro Shield Plus (DL03CC4482)",
    createdAt: "2026-08-15T10:35:00Z",
  },
  {
    id: "txn-9910",
    dealerId: "dlr-9941",
    type: "payout_debit",
    amount: -15000,
    status: "settled",
    referenceId: "PAYOUT-5501",
    description: "NEFT Withdrawal to HDFC A/C *1234",
    createdAt: "2026-08-01T12:00:00Z",
  },
  {
    id: "txn-9909",
    dealerId: "dlr-9941",
    type: "package_bonus",
    amount: 2500,
    status: "settled",
    referenceId: "BONUS-Q2",
    description: "Quarterly Target Milestone Bonus (25+ active vehicles)",
    createdAt: "2026-07-01T09:00:00Z",
  },
];

let mockPayouts: PayoutRequest[] = [
  {
    id: "payout-5502",
    dealerId: "dlr-9941",
    dealerName: "Apex Motors Autocare Pvt Ltd",
    amount: 5000,
    status: "processing",
    bankAccount: {
      accountHolderName: "Apex Motors Autocare Pvt Ltd",
      accountNumber: "918020038891234",
      ifscOrRouting: "HDFC0001234",
      bankName: "HDFC Bank Ltd",
    },
    requestedAt: "2026-09-28T14:15:00Z",
  },
  {
    id: "payout-5501",
    dealerId: "dlr-9941",
    dealerName: "Apex Motors Autocare Pvt Ltd",
    amount: 15000,
    status: "completed",
    bankAccount: {
      accountHolderName: "Apex Motors Autocare Pvt Ltd",
      accountNumber: "918020038891234",
      ifscOrRouting: "HDFC0001234",
      bankName: "HDFC Bank Ltd",
    },
    requestedAt: "2026-07-31T11:00:00Z",
    processedAt: "2026-08-01T12:00:00Z",
  },
];

export const walletApi = {
  getSummary: async (): Promise<WalletSummary> => {
    try {
      const res = await api.get<WalletSummary>(API_ENDPOINTS.wallet.summary);
      return res.data?.currentBalance !== undefined ? res.data : mockWalletSummary;
    } catch {
      return mockWalletSummary;
    }
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    try {
      const res = await api.get<WalletTransaction[]>(
        API_ENDPOINTS.wallet.transactions
      );
      return Array.isArray(res.data) ? res.data : mockTransactions;
    } catch {
      return mockTransactions;
    }
  },

  getPayoutRequests: async (): Promise<PayoutRequest[]> => {
    try {
      const res = await api.get<PayoutRequest[]>(
        API_ENDPOINTS.wallet.payoutHistory
      );
      return Array.isArray(res.data) ? res.data : mockPayouts;
    } catch {
      return mockPayouts;
    }
  },

  requestPayout: async (
    payload: Omit<PayoutRequest, "id" | "status" | "requestedAt">
  ): Promise<PayoutRequest> => {
    const newPayout: PayoutRequest = {
      ...payload,
      id: `payout-${Date.now().toString().slice(-4)}`,
      status: "requested",
      requestedAt: new Date().toISOString(),
    };

    try {
      const res = await api.post<PayoutRequest>(
        API_ENDPOINTS.wallet.requestPayout,
        newPayout
      );
      mockPayouts.unshift(res.data || newPayout);
      mockWalletSummary.currentBalance -= payload.amount;
      mockWalletSummary.pendingPayouts += payload.amount;
      return res.data || newPayout;
    } catch {
      mockPayouts.unshift(newPayout);
      mockWalletSummary.currentBalance -= payload.amount;
      mockWalletSummary.pendingPayouts += payload.amount;
      return newPayout;
    }
  },
};
