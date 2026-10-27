export const siteConfig = {
  name: "NextTow",
  shortName: "NextTow",
  description:
    "India's premier 24/7 on-demand towing, heavy vehicle recovery, and roadside assistance network. 15-minute average dispatch across 40+ metropolitan hubs.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://nexttow.com",
  ogImage: "https://nexttow.com/og-image.jpg",
  emergencyPhone: "+91 90166 16324",
  emergencyPhoneRaw: "+919016616324",
  supportEmail: "support@nexttow.com",
  dealerSupportEmail: "dealers@nexttow.com",
  operatingHours: "24/7/365",
  headquarters: {
    address: "Tower B, Cyber City Tech Park",
    city: "Gurugram",
    state: "Haryana",
    postalCode: "122002",
    country: "India",
  },
  links: {
    twitter: "https://twitter.com/nexttow",
    linkedin: "https://linkedin.com/company/nexttow",
  },
};

export type SiteConfig = typeof siteConfig;
