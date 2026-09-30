export const siteConfig = {
  name: "TowChain",
  shortName: "TowChain",
  description:
    "India's premier 24/7 on-demand towing, heavy vehicle recovery, and roadside assistance network. 15-minute average dispatch across 40+ metropolitan hubs.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://towchain.com",
  ogImage: "https://towchain.com/og-image.jpg",
  emergencyPhone: "1800-890-8697",
  emergencyPhoneRaw: "+9118008908697",
  supportEmail: "support@towchain.com",
  dealerSupportEmail: "dealers@towchain.com",
  operatingHours: "24/7/365",
  headquarters: {
    address: "Tower B, Cyber City Tech Park",
    city: "Gurugram",
    state: "Haryana",
    postalCode: "122002",
    country: "India",
  },
  links: {
    twitter: "https://twitter.com/towchain",
    linkedin: "https://linkedin.com/company/towchain",
  },
};

export type SiteConfig = typeof siteConfig;
