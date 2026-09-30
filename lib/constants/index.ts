import { RsaPackage } from "@/types";

export * from "./services";
export * from "./locations";
export * from "./faq";

export const VEHICLE_CATEGORY_LABELS: Record<string, { label: string; multiplier: number; icon: string }> = {
  sedan: { label: "Hatchback / Sedan", multiplier: 1.0, icon: "Car" },
  suv: { label: "SUV / Compact SUV", multiplier: 1.2, icon: "CarFront" },
  luxury: { label: "Luxury / Sports Car", multiplier: 1.5, icon: "Sparkles" },
  commercial: { label: "Light Commercial Van", multiplier: 1.6, icon: "Truck" },
  motorcycle: { label: "Motorcycle / Superbike", multiplier: 0.8, icon: "Bike" },
  ev: { label: "Electric Vehicle (EV)", multiplier: 1.3, icon: "Zap" },
};

export const DEFAULT_PACKAGES: RsaPackage[] = [
  {
    id: "pkg-essential",
    title: "TowChen Essential RSA",
    slug: "essential-rsa",
    tier: "essential",
    validityDays: 365,
    price: 1999,
    mrp: 2999,
    dealerCommission: 500,
    towsIncluded: 2,
    coverageRadiusKm: 30,
    features: [
      "2 Free Tows (up to 30km radius)",
      "Unlimited Battery Jumpstart",
      "Unlimited Flat Tire Swap Support",
      "Emergency Fuel Drop (fuel charged at pump)",
      "24/7 Dedicated Priority Dispatch Hotline",
    ],
    popular: false,
  },
  {
    id: "pkg-pro-shield",
    title: "TowChen Pro Shield Plus",
    slug: "pro-shield-plus",
    tier: "pro_shield",
    validityDays: 365,
    price: 3499,
    mrp: 4999,
    dealerCommission: 900,
    towsIncluded: 4,
    coverageRadiusKm: 60,
    features: [
      "4 Free Flatbed Tows (up to 60km radius)",
      "Unlimited Battery Jumpstarts & Alternator Check",
      "On-spot Tubeless Puncture Repairs",
      "Free 5L Emergency Fuel included",
      "Zero-damage Key Lockout assistance",
      "Accident on-scene coordination & insurance claim assistance",
    ],
    popular: true,
  },
  {
    id: "pkg-elite-fleet",
    title: "TowChen Elite Fleet & Luxury",
    slug: "elite-fleet-luxury",
    tier: "elite_fleet",
    validityDays: 365,
    price: 5999,
    mrp: 7999,
    dealerCommission: 1600,
    towsIncluded: 6,
    coverageRadiusKm: 120,
    features: [
      "6 Free Luxury Hydraulic Flatbed Tows (up to 120km)",
      "Interstate Highway Emergency Recovery",
      "Hotel stay & onward cab reimbursement up to ₹5,000",
      "EV High-Voltage Emergency Rescue compliant",
      "VIP Dedicated Fleet Supervisor assigned",
      "Year-round complimentary 21-point vehicle health check",
    ],
    popular: false,
  },
];
