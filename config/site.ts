export const siteConfig = {
  name: "TowChen",
  shortName: "TowChen",
  description:
    "India's premier 24/7 on-demand towing, heavy vehicle recovery, and roadside assistance network. 15-minute average dispatch across 40+ metropolitan hubs.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://towchen.com",
  ogImage: "https://towchen.com/og-image.jpg",
  emergencyPhone: "1800-890-8697",
  emergencyPhoneRaw: "+9118008908697",
  supportEmail: "support@towchen.com",
  dealerSupportEmail: "dealers@towchen.com",
  operatingHours: "24/7/365",
  headquarters: {
    address: "Tower B, Cyber City Tech Park",
    city: "Gurugram",
    state: "Haryana",
    postalCode: "122002",
    country: "India",
  },
  links: {
    twitter: "https://twitter.com/towchen",
    linkedin: "https://linkedin.com/company/towchen",
  },
};

export type SiteConfig = typeof siteConfig;
