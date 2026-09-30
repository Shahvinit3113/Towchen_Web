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
