import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { WalletSummary, WalletTransaction, PayoutRequest } from "@/types";

export const walletApi = {
  getSummary: async (): Promise<WalletSummary> => {
    const res = await api.get<WalletSummary>(API_ENDPOINTS.wallet.summary);
    return (res.data as any)?.data || res.data;
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    const res = await api.get<WalletTransaction[]>(
      API_ENDPOINTS.wallet.transactions
    );
    const data = (res.data as any)?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  getPayoutRequests: async (): Promise<PayoutRequest[]> => {
    const res = await api.get<PayoutRequest[]>(
      API_ENDPOINTS.wallet.payoutHistory
    );
    const data = (res.data as any)?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  requestPayout: async (
    payload: Omit<PayoutRequest, "id" | "status" | "requestedAt">
  ): Promise<PayoutRequest> => {
    const res = await api.post<PayoutRequest>(
      API_ENDPOINTS.wallet.requestPayout,
      payload
    );
    return (res.data as any)?.data || res.data;
  },
};
