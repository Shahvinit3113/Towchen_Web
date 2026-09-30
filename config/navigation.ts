export interface NavItem {
  title: string;
  href: string;
  badge?: string;
  icon?: string;
}

export const publicNavLinks: NavItem[] = [
  { title: "Towing", href: "/towing" },
  { title: "Roadside Assistance", href: "/roadside-assistance" },
  { title: "Services", href: "/services" },
  { title: "Locations", href: "/locations" },
  { title: "About", href: "/about" },
  { title: "FAQ", href: "/faq" },
  { title: "Contact", href: "/contact" },
];

export const dealerNavLinks: NavItem[] = [
  { title: "Dashboard", href: "/dealer/dashboard", icon: "LayoutDashboard" },
  { title: "Vehicles & RC", href: "/dealer/vehicles", icon: "CarFront" },
  { title: "RSA Packages", href: "/dealer/packages", icon: "ShieldCheck" },
  { title: "Wallet & Earnings", href: "/dealer/wallet", icon: "Wallet" },
  { title: "Transactions", href: "/dealer/transactions", icon: "ReceiptText" },
  { title: "Payments", href: "/dealer/payments", icon: "CreditCard" },
  { title: "Dealer Profile", href: "/dealer/profile", icon: "Building2" },
];

export const adminNavLinks: NavItem[] = [
  { title: "Admin Overview", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { title: "Dealers Directory", href: "/admin/dealers", icon: "Users" },
  { title: "Packages & Tiers", href: "/admin/packages", icon: "Package" },
  { title: "Purchases Ledger", href: "/admin/purchases", icon: "ShoppingBag" },
  { title: "Commissions", href: "/admin/commissions", icon: "Percent" },
  { title: "Payout Approvals", href: "/admin/payments", icon: "Banknote" },
  { title: "Financial Audits", href: "/admin/transactions", icon: "Scale" },
];
