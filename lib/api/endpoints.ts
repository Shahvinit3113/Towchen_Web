export const API_ENDPOINTS = {
  auth: {
    dealerLogin: "/dealer-auth/login",
    dealerRegister: "/dealer-auth/register",
    dealerMe: "/dealer-auth/me",
    dealerRefresh: "/dealer-auth/refresh",
    me: "/dealer-auth/me",
    logout: "/auth/logout",
  },
  towing: {
    estimate: "/towing/estimate",
    services: "/towing/services",
    book: "/towing/book",
    track: (bookingId: string) => `/towing/track/${bookingId}`,
  },
  vehicles: {
    list: "/vehicles",
    register: "/vehicles/register",
    detail: (id: string) => `/vehicles/${id}`,
    uploadRc: (id: string) => `/vehicles/${id}/rc-document`,
    uploadInspection: (id: string) => `/vehicles/${id}/inspection`,
  },
  packages: {
    list: "/packages",
    detail: (id: string) => `/packages/${id}`,
    purchase: "/packages/purchase",
    mySubscriptions: "/packages/subscriptions",
  },
  dealer: {
    stats: "/dealer/stats",
    profile: "/dealer/profile",
    updateProfile: "/dealer/profile",
  },
  wallet: {
    summary: "/wallet/summary",
    transactions: "/wallet/transactions",
    requestPayout: "/wallet/payout-request",
    payoutHistory: "/wallet/payouts",
  },
  payments: {
    createIntent: "/payments/create-intent",
    verify: "/payments/verify",
    history: "/payments/history",
  },
} as const;
