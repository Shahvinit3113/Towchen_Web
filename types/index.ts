export type UserRole = "customer" | "dealer";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  refreshToken?: string;
  dealerId?: string;
  businessName?: string;
  phone?: string;
}

export interface DealerAuthUser {
  id: number | string;
  formated_id?: string;
  email: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  name?: string;
  businessName?: string;
  phone?: string;
  number?: string;
  alternative_number?: string | null;
  residential_address?: string | null;
  bank_name?: string | null;
  ifsc_code?: string;
  account_number?: string;
  account_holder_name?: string;
  dealer_image?: string | null;
  aadhar_image?: string | null;
  pan_image?: string | null;
  bankdetails_image?: string | null;
}

export interface DealerLoginResponse {
  access_token: string;
  refresh_token?: string;
  dealer: DealerAuthUser;
}

export type VehicleCategory =
  | "sedan"
  | "suv"
  | "luxury"
  | "commercial"
  | "motorcycle"
  | "ev";

export type TowingServiceType =
  | "flatbed_towing"
  | "wheel_lift_towing"
  | "accident_recovery"
  | "ev_towing"
  | "jumpstart"
  | "flat_tire"
  | "tire_change"
  | "fuel_delivery"
  | "lockout"
  | "winch_out"
  | "vehicle_recovery"
  | (string & {});


export interface TowingEstimateRequest {
  pickupLocation: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLocation: string;
  dropLat?: number;
  dropLng?: number;
  vehicleCategory?: VehicleCategory;
  serviceType: TowingServiceType;
  requiresSpecialFlatbed?: boolean;
  breakdown_place_id?: string;
  dropoff_place_id?: string;
  sub_service_id?: number;
}

export interface TowingEstimateResponse {
  distanceMiles?: number;
  distanceKm: number;
  distanceFormatted?: string;
  durationFormatted?: string;
  baseFare: number;
  distanceFare: number;
  vehicleCategoryCharge: number;
  totalEstimatedPrice: number;
  totalEstimatedPriceFormatted?: string;
  estimatedEtaMinutes: number;
  serviceType: TowingServiceType;
  vehicleCategory: VehicleCategory;
  isApproximate?: boolean;
  sub_services?: any[];
  rawEstimate?: any;
  breakdown: {
    baseRate: number;
    perKmRate: number;
    taxes: number;
  };
}

export interface BookingSubmissionRequest {
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropLocation: string;
  vehicleCategory: VehicleCategory;
  serviceType: TowingServiceType;
  vehicleModel?: string;
  registrationNumber?: string;
  notes?: string;
}

export interface BookingConfirmation {
  bookingId: string;
  status: "dispatched" | "en_route" | "arrived" | "completed" | "cancelled";
  estimatedEtaMinutes: number;
  driverName?: string;
  driverPhone?: string;
  towTruckPlate?: string;
  trackingUrl?: string;
  totalAmount: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  basePrice: number;
  category: "towing" | "roadside";
  features: string[];
}

export interface LocationHub {
  city: string;
  slug: string;
  state: string;
  responseTimeMinutes: number;
  fleetCount: number;
  activeDrivers: number;
  coverageAreas: string[];
  helpline: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: "general" | "towing" | "roadside" | "pricing" | "dealer";
}

// Dealer & Vehicle Types
export interface VehicleInspectionPhotos {
  front?: string;
  rear?: string;
  left?: string;
  right?: string;
  dashboard?: string;
  odometer?: string;
  damage?: string;
  capturedAt: string;
}

export interface VehicleRecord {
  id: string;
  dealerId: string;
  vinOrChassis: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  rcDocumentUrl?: string;
  inspectionPhotos?: VehicleInspectionPhotos;
  status: "verified" | "pending_rc" | "pending_inspection" | "rejected";
  assignedPackageId?: string;
  packageName?: string;
  registeredAt: string;
}

export interface RsaPackage {
  id: string;
  title: string;
  slug: string;
  tier: "essential" | "pro_shield" | "elite_fleet";
  validityDays: number;
  price: number;
  mrp: number;
  dealerCommission: number;
  towsIncluded: number;
  coverageRadiusKm: number;
  features: string[];
  popular?: boolean;
}

export interface PackagePurchase {
  id: string;
  dealerId: string;
  packageId: string;
  packageName: string;
  vehicleId: string;
  vehicleRegistration: string;
  customerName: string;
  customerPhone: string;
  amountPaid: number;
  commissionEarned: number;
  status: "active" | "expired" | "cancelled";
  purchasedAt: string;
  expiresAt: string;
}

export interface WalletSummary {
  dealerId: string;
  currentBalance: number;
  lifetimeEarnings: number;
  pendingPayouts: number;
  lockedReserve: number;
  totalWithdrawn: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  dealerId: string;
  type: "commission_credit" | "payout_debit" | "package_bonus" | "adjustment";
  amount: number;
  status: "settled" | "pending" | "failed";
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  dealerId: string;
  dealerName?: string;
  amount: number;
  status: "requested" | "processing" | "completed" | "rejected";
  bankAccount: {
    accountNumber: string;
    ifscOrRouting: string;
    accountHolderName: string;
    bankName: string;
  };
  requestedAt: string;
  processedAt?: string;
}

export interface DealerProfile {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  gstinOrTaxId: string;
  isVerified: boolean;
  commissionTier: "standard" | "gold" | "platinum";
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscOrRouting: string;
    bankName: string;
  };
}
