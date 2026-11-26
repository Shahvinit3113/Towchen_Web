"use client";

import React, { useState, useEffect } from "react";
import { packagesApi } from "@/lib/api/packages";
import { dealerApi } from "@/lib/api/dealer";
import { vehiclesApi } from "@/lib/api/vehicles";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Camera,
  MapPin,
  Shield,
  Clock,
  Car,
  Hotel,
  Navigation,
  ChevronDown,
  Eye,
  Maximize2,
  Wrench,
  Zap,
  Disc,
  Fuel,
  KeyRound,
  Headphones,
  FileCheck,
  Sparkles,
  X,
  RotateCcw,
  Loader2,
  Search,
} from "lucide-react";
import Swal, {
  Toast,
  showToast,
  showPendingInspectionModal,
  showOrderActiveModal,
  showOrderErrorModal,
} from "@/lib/swal";

const CAR_SEGMENTS = [
  { label: "Gold", value: "Basic" },
  { label: "Platinum", value: "Standard" },
  { label: "Diamond", value: "Premium" },
] as const;

const getSegmentLabel = (val: string) => {
  return CAR_SEGMENTS.find((s) => s.value === val || s.label.toLowerCase() === val?.toLowerCase())?.label || val;
};

const initialFormData = {
  name: "",
  number: "",
  altNumber: "",
  email: "",
  building: "",
  block: "",
  road: "",
  city: "",
  state: "",
  pincode: "",
  gstNumber: "",
  regNumber: "",
  make: "",
  model: "",
  fuelType: "Petrol",
  transmissionType: "Manual",
  registrationYear: new Date().getFullYear(),
  chassisNumber: "",
  odometerReading: "",
};

export default function DealerPackagesPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [dealerPayoutPercentage, setDealerPayoutPercentage] = useState<number>(0);
  
  const [segment, setSegment] = useState<string>("Basic");

  // Single card accordion state (only 1 card open at a time)
  const [expandedPlanId, setExpandedPlanId] = useState<number | string | null>(null);
  // Big screen full details modal state
  const [viewingDetailPlan, setViewingDetailPlan] = useState<any | null>(null);

  const toggleExpand = (id: number | string) => {
    setExpandedPlanId((prev) => (prev === id ? null : id));
  };

  // Checkout modal state
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Cashfree Vehicle RC fetch state
  const [isVehicleFetched, setIsVehicleFetched] = useState(false);
  const [isFetchingVehicle, setIsFetchingVehicle] = useState(false);
  const [vehicleFetchError, setVehicleFetchError] = useState<string | null>(null);
  const [isManualOverride, setIsManualOverride] = useState(false);

  const resetModalState = () => {
    setSelectedPlan(null);
    setCurrentStep(1);
    setFormData(initialFormData);
    setErrors({});
    clearAllFiles();
    setIsVehicleFetched(false);
    setIsFetchingVehicle(false);
    setVehicleFetchError(null);
    setIsManualOverride(false);
  };

  const openCheckoutModal = (plan: any) => {
    setSelectedPlan(plan);
    setCurrentStep(1);
    setFormData(initialFormData);
    setErrors({});
    clearAllFiles();
    setIsVehicleFetched(false);
    setIsFetchingVehicle(false);
    setVehicleFetchError(null);
    setIsManualOverride(false);
  };

  // Form State
  const [formData, setFormData] = useState(initialFormData);

  // Files
  const [files, setFiles] = useState<{
    front: File | null;
    rear: File | null;
    left: File | null;
    right: File | null;
    odometer: File | null;
  }>({
    front: null,
    rear: null,
    left: null,
    right: null,
    odometer: null,
  });

  const [filePreviews, setFilePreviews] = useState<{
    front: string | null;
    rear: string | null;
    left: string | null;
    right: string | null;
    odometer: string | null;
  }>({
    front: null,
    rear: null,
    left: null,
    right: null,
    odometer: null,
  });

  const [geoData, setGeoData] = useState<{ latitude: number | null; longitude: number | null; captured_at: string } | null>(null);
  const [isCapturingGeo, setIsCapturingGeo] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dealerApi.getAccountDetails().then((dealer) => {
      if (dealer && dealer.payout_percentage !== undefined) {
        setDealerPayoutPercentage(Number(dealer.payout_percentage));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadPlans(segment);
  }, [segment]);

  async function loadPlans(seg: string) {
    setIsLoadingPlans(true);
    try {
      const data = await packagesApi.getDealerPackagePlans(seg);
      if (Array.isArray(data)) {
        setPlans(data);
      } else if (data && Array.isArray(data.data)) {
        setPlans(data.data);
      } else if (data && Array.isArray(data.items)) {
        setPlans(data.items);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setIsLoadingPlans(false);
    }
  }

  const captureGeoLocation = () => {
    setIsCapturingGeo(true);
    if (!navigator.geolocation) {
      setGeoData({ latitude: null, longitude: null, captured_at: new Date().toISOString() });
      setIsCapturingGeo(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          captured_at: new Date().toISOString(),
        });
        setIsCapturingGeo(false);
      },
      () => {
        setGeoData({ latitude: null, longitude: null, captured_at: new Date().toISOString() });
        setIsCapturingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFiles((prev) => ({ ...prev, [key]: selected }));
      if (filePreviews[key]) {
        URL.revokeObjectURL(filePreviews[key]!);
      }
      const url = URL.createObjectURL(selected);
      setFilePreviews((prev) => ({ ...prev, [key]: url }));
      if (!geoData) captureGeoLocation(); // Capture once when an image is selected
    }
  };

  const removeSingleFile = (key: keyof typeof files, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (filePreviews[key]) {
      URL.revokeObjectURL(filePreviews[key]!);
    }
    setFilePreviews((prev) => ({ ...prev, [key]: null }));
    setFiles((prev) => ({ ...prev, [key]: null }));
  };

  const clearAllFiles = () => {
    Object.values(filePreviews).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    setFilePreviews({ front: null, rear: null, left: null, right: null, odometer: null });
    setFiles({ front: null, rear: null, left: null, right: null, odometer: null });
  };

  const checkIsCommercialRc = (rc: any): { isCommercial: boolean; reason: string } => {
    if (!rc) return { isCommercial: false, reason: "" };
    if (rc.is_commercial) {
      return { isCommercial: true, reason: rc.commercial_reason || rc.class || "Commercial vehicle" };
    }

    const category = String(rc.vehicle_category || rc.category || "").toUpperCase().trim();
    if (category === "TRANSPORT" || (category.includes("COMMERCIAL") && !category.includes("NON-COMMERCIAL"))) {
      return { isCommercial: true, reason: `Vehicle category is ${category}` };
    }

    const vehicleClass = String(rc.class || rc.vehicle_class || "").toUpperCase().trim();
    const vehicleType = String(rc.type || rc.body_type || "").toUpperCase().trim();
    const combined = `${vehicleClass} ${vehicleType}`;

    const commercialKeywords = [
      "GOODS CARRIER",
      "GOODS VEHICLE",
      "LIGHT GOODS",
      "MEDIUM GOODS",
      "HEAVY GOODS",
      "LGV",
      "HGV",
      "MGV",
      "LCV",
      "MAXI CAB",
      "MOTOR CAB",
      "TAXI",
      "CAB",
      "TOURIST",
      "STAGE CARRIAGE",
      "CONTRACT CARRIAGE",
      "OMNIBUS",
      "BUS",
      "AMBULANCE",
      "COMMERCIAL",
      "PUBLIC SERVICE",
      "TRAILER",
      "DUMPER",
      "TIPPER",
      "TANKER",
      "AUTO RICKSHAW",
      "E-RICKSHAW",
      "THREE WHEELER",
      "3-WHEELER",
      "TRACTOR",
      "DELIVERY VAN",
      "LOAD CARRIER",
    ];

    for (const kw of commercialKeywords) {
      if (combined.includes(kw)) {
        return { isCommercial: true, reason: rc.class || rc.type || kw };
      }
    }

    return { isCommercial: false, reason: "" };
  };

  const handleFetchVehicleRc = async () => {
    const regNo = (formData.regNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!regNo || regNo.length < 4) {
      setErrors((prev) => ({ ...prev, regNumber: "Please enter a valid registration number" }));
      return;
    }

    setIsFetchingVehicle(true);
    setVehicleFetchError(null);

    try {
      const rc = await vehiclesApi.verifyVehicleRc(regNo, { rejectCommercial: true });

      // Check if commercial vehicle
      const commercialStatus = checkIsCommercialRc(rc);
      if (commercialStatus.isCommercial) {
        const errorMsg = `This vehicle (${regNo}) is registered as a Commercial vehicle [${commercialStatus.reason}]. Commercial vehicles cannot be prefilled into dealer packages.`;
        setVehicleFetchError(errorMsg);
        setIsVehicleFetched(false);
        setErrors((prev) => ({
          ...prev,
          regNumber: `Commercial vehicle detected (${commercialStatus.reason}). Details cannot be prefilled.`,
        }));
        showToast("error", errorMsg);
        return;
      }

      if (rc && (rc.status === "VALID" || rc.reg_no || rc.vehicle_manufacturer_name || rc.chassis)) {
        // Extract registration year from reg_date
        let year = new Date().getFullYear();
        if (rc.reg_date) {
          const matchedYear = String(rc.reg_date).match(/\d{4}/);
          if (matchedYear) {
            year = parseInt(matchedYear[0], 10);
          }
        }

        // Normalize Fuel Type to "Petrol" | "Diesel" | "CNG" | "Electric"
        let normalizedFuel = "Petrol";
        const rawFuel = String(rc.type || rc.fuel_type || "").toUpperCase();
        if (rawFuel.includes("DIESEL")) normalizedFuel = "Diesel";
        else if (rawFuel.includes("CNG")) normalizedFuel = "CNG";
        else if (rawFuel.includes("ELEC") || rawFuel.includes("BATTERY") || rawFuel.includes("EV")) normalizedFuel = "Electric";

        setFormData((prev) => ({
          ...prev,
          regNumber: rc.reg_no || rc.vehicle_number || regNo,
          make: rc.vehicle_manufacturer_name || rc.maker || prev.make || "Unknown Make",
          model: rc.model || prev.model || "Unknown Model",
          fuelType: normalizedFuel,
          registrationYear: year,
          chassisNumber: rc.chassis || prev.chassisNumber || "N/A",
          name: prev.name || rc.owner || rc.owner_name || "",
        }));

        setIsVehicleFetched(true);
        setIsManualOverride(false);
        setErrors((prev) => {
          const clean = { ...prev };
          delete clean.regNumber;
          delete clean.make;
          delete clean.model;
          delete clean.chassisNumber;
          delete clean.registrationYear;
          return clean;
        });
        showToast("success", "Vehicle RC details fetched successfully!");
      } else {
        const errorMsg = rc?.message || "Vehicle RC record not found or invalid";
        setVehicleFetchError(errorMsg);
        showToast("error", errorMsg);
      }
    } catch (err: any) {
      console.error("RC fetch error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch vehicle RC details. Check IP whitelisting or try manual entry.";
      setVehicleFetchError(errMsg);
      setIsVehicleFetched(false);
      showToast("error", errMsg);

      if (errMsg.toLowerCase().includes("commercial")) {
        setErrors((prev) => ({
          ...prev,
          regNumber: errMsg,
        }));
      }

      // Auto-switch to manual override if daily limit (25 req/day) is hit so dealers are never blocked
      if (err?.status === 429 || errMsg.toLowerCase().includes("daily limit")) {
        setIsManualOverride(true);
      }
    } finally {
      setIsFetchingVehicle(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!isVehicleFetched && !isManualOverride) {
        newErrors.regNumber = "Please fetch vehicle details using the registration number";
        setErrors(newErrors);
        return false;
      }
      if (!formData.regNumber.trim()) newErrors.regNumber = "Registration number is required";
      else if (formData.regNumber.trim().length < 4) newErrors.regNumber = "Enter a valid registration number";
      if (!formData.make.trim()) newErrors.make = "Vehicle make is required";
      if (!formData.model.trim()) newErrors.model = "Vehicle model is required";
      if (!formData.odometerReading) newErrors.odometerReading = "Odometer reading is required";
      if (!formData.chassisNumber.trim()) newErrors.chassisNumber = "Chassis number is required";
      else if (formData.chassisNumber.trim().length < 5) newErrors.chassisNumber = "Enter a valid chassis number";
      if (formData.registrationYear < 1990 || formData.registrationYear > new Date().getFullYear() + 1) {
        newErrors.registrationYear = "Enter a valid year";
      }
    }

    if (step === 2) {
      if (!formData.name.trim()) newErrors.name = "Customer name is required";
      if (!formData.number.trim()) newErrors.number = "Mobile number is required";
      else if (!/^\d{10}$/.test(formData.number.trim())) newErrors.number = "Enter a valid 10-digit mobile number";
      if (formData.altNumber && !/^\d{10}$/.test(formData.altNumber.trim())) newErrors.altNumber = "Enter a valid 10-digit number";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = "Enter a valid email address";
    }

    if (step === 3) {
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
      else if (!/^\d{6}$/.test(formData.pincode.trim())) newErrors.pincode = "Enter a valid 6-digit pincode";
    }

        if (step === 4) {
      // Photos are optional for dealer form submission; if any are selected, encourage all 5, or allow clearing for customer upload
      const hasAnyPhoto = Boolean(files.front || files.rear || files.left || files.right || files.odometer);
      const hasAllPhotos = Boolean(files.front && files.rear && files.left && files.right && files.odometer);
      if (hasAnyPhoto && !hasAllPhotos) {
        if (!files.front) newErrors.front = "Required if uploading";
        if (!files.rear) newErrors.rear = "Required if uploading";
        if (!files.left) newErrors.left = "Required if uploading";
        if (!files.right) newErrors.right = "Required if uploading";
        if (!files.odometer) newErrors.odometer = "Required if uploading";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (currentStep === 1 && !isVehicleFetched && !isManualOverride) {
      await handleFetchVehicleRc();
      return;
    }

    if (!validateStep(currentStep)) return;

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    setIsProcessing(true);
    try {
            const hasInspectionImages = Boolean(files.front || files.rear || files.left || files.right || files.odometer);
      const payload = {
        customerData: { ...formData },
        vehicleData: { ...formData, odometerReading: Number(formData.odometerReading), carSegment: segment },
        packageData: {
          planId: selectedPlan.id,
          startDate: new Date().toISOString().split('T')[0],
        },
        files: files,
        geoData: geoData || undefined,
        uploaded_by_dealer: hasInspectionImages,
      };

      const purchase = await packagesApi.submitDealerPackageOrder(payload);
      resetModalState();
      if (purchase?.status === "PendingInspection") {
        showToast("info", `Order ${purchase?.order_number || ""} saved (Pending Inspection)`);
        const result = await showPendingInspectionModal(purchase?.order_number);
        if (result.isConfirmed) {
          window.location.href = "/dealer/package-history";
        }
      } else {
        showToast("success", `Package ${purchase?.order_number || ""} successfully activated!`);
        const result = await showOrderActiveModal(purchase?.order_number, purchase?.package_pdf_url);
        if (result.isConfirmed) {
          if (purchase?.package_pdf_url) {
            window.open(purchase.package_pdf_url, "_blank");
          } else {
            window.location.href = "/dealer/package-history";
          }
        }
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || "Failed to process package purchase.";
      showToast("error", errorMsg);
      showOrderErrorModal(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Dealer Packages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Choose from our roadside assistance plans and activate coverage for your customers.
          </p>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-2 bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl w-full sm:w-fit">
        {CAR_SEGMENTS.map(seg => (
          <button
            key={seg.value}
            onClick={() => setSegment(seg.value)}
            className={`text-center px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              segment === seg.value ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      {isLoadingPlans ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></div>
          <span className="text-sm font-medium">Loading plans...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-base font-semibold">No plans available for this segment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-6 items-start">
          {plans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={cn(
                  "group relative rounded-xl sm:rounded-2xl border bg-white flex flex-col justify-between transition-all duration-300 overflow-hidden shadow-2xs",
                  isExpanded
                    ? "border-primary/60 ring-2 ring-primary/10 shadow-lg shadow-primary/10"
                    : "border-slate-200/90 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                )}
              >
                {/* Top Accent */}
                <div className="h-1 sm:h-1.5 bg-gradient-to-r from-primary via-blue-500 to-indigo-500" />

                <div className="p-3.5 sm:p-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                          {plan.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {plan.plan_period_months
                            ? `${plan.plan_period_months} Months`
                            : "12 Months"}{" "}
                          Coverage
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0 font-bold">
                      {getSegmentLabel(segment)}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="mb-3.5 sm:mb-5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {formatCurrency(plan.resolved_price || plan.base_price || 0)}
                    </span>
                    {plan.base_price &&
                      plan.resolved_price &&
                      plan.base_price !== plan.resolved_price && (
                        <span className="text-xs sm:text-sm text-slate-400 line-through ml-2">
                          {formatCurrency(plan.base_price)}
                        </span>
                      )}
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                      One-time payment
                    </p>
                    {dealerPayoutPercentage > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                          Dealer Payout ({dealerPayoutPercentage}%): {formatCurrency(Math.round((((plan.resolved_price || plan.base_price || 0) * dealerPayoutPercentage) / 100) * 100) / 100)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3.5 sm:mb-5">
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-50 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2.5">
                      <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {plan.incidents || "Unlimited"}
                        </p>
                        <p className="text-[10px] text-slate-500">Incidents</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-50 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2.5">
                      <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {plan.distance_km ? `${plan.distance_km} km` : "50 km"}
                        </p>
                        <p className="text-[10px] text-slate-500">Tow Distance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-50 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2.5">
                      <Hotel className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {plan.hotel_accommodation || 0} Nights
                        </p>
                        <p className="text-[10px] text-slate-500">Hotel Stay</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-50 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2.5">
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {plan.cab_service || 0} Rides
                        </p>
                        <p className="text-[10px] text-slate-500">Cab Service</p>
                      </div>
                    </div>
                  </div>

                  {/* Extra Features List (if available from API) */}
                  {plan.features &&
                    Array.isArray(plan.features) &&
                    plan.features.length > 0 && (
                      <ul className="space-y-1.5 sm:space-y-2 mb-3.5 sm:mb-5">
                        {plan.features.map((f: string, i: number) => (
                          <li
                            key={i}
                            className="text-xs sm:text-sm text-slate-600 flex items-start gap-2"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                  {/* Actions Row: View Details Toggle + Big Screen Modal + Activate CTA */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(plan.id)}
                        className={cn(
                          "flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95",
                          isExpanded
                            ? "bg-primary/10 border-primary/30 text-primary shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                        )}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewingDetailPlan(plan)}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-slate-600 transition-all cursor-pointer active:scale-95 shrink-0"
                        title="Open full details in Big Screen Modal"
                      >
                        <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>

                    <Button
                      className="w-full font-bold gap-2 h-9 sm:h-11 text-xs sm:text-sm rounded-xl group-hover:bg-secondary transition-colors"
                      onClick={() => openCheckoutModal(plan)}
                    >
                      Activate Plan{" "}
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>

                  {/* Accordion Expanded Details (Placed below action buttons so toggle never gets pushed down) */}
                  {isExpanded && (
                    <div className="pt-3.5 mt-3 border-t border-slate-200/90 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Coverage Specs Summary Banner */}
                      <div className="rounded-xl bg-gradient-to-br from-primary/5 via-blue-50/60 to-indigo-50/40 border border-primary/20 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> Full Plan Inclusions
                          </span>
                          <button
                            type="button"
                            onClick={() => setViewingDetailPlan(plan)}
                            className="text-[10px] font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            Big Screen <Maximize2 className="h-2.5 w-2.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-white/90 rounded-lg p-2 border border-slate-200/70 shadow-2xs">
                            <span className="text-slate-400 block text-[10px]">Validity</span>
                            <strong className="text-slate-800 font-bold">
                              {plan.plan_period_months ? `${plan.plan_period_months} Months` : "12 Months"}
                            </strong>
                          </div>
                          <div className="bg-white/90 rounded-lg p-2 border border-slate-200/70 shadow-2xs">
                            <span className="text-slate-400 block text-[10px]">Incident Limit</span>
                            <strong className="text-slate-800 font-bold">
                              {plan.incidents || "Unlimited"} Allowed
                            </strong>
                          </div>
                          <div className="bg-white/90 rounded-lg p-2 border border-slate-200/70 shadow-2xs">
                            <span className="text-slate-400 block text-[10px]">Free Towing</span>
                            <strong className="text-slate-800 font-bold">
                              {plan.distance_km ? `${plan.distance_km} km` : "50 km"} / incident
                            </strong>
                          </div>
                          <div className="bg-white/90 rounded-lg p-2 border border-slate-200/70 shadow-2xs">
                            <span className="text-slate-400 block text-[10px]">Hotel & Cab</span>
                            <strong className="text-slate-800 font-bold">
                              {plan.hotel_accommodation || 0}N / {plan.cab_service || 0} Rides
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Included Roadside Services (All Open) */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          All Included Services
                        </p>
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {[
                            {
                              title: "24x7 Breakdown Towing",
                              desc: `Up to ${plan.distance_km || 50} km to nearest workshop`,
                              icon: Navigation,
                            },
                            {
                              title: "Battery Jumpstart",
                              desc: "Quick on-site jumpstart assistance",
                              icon: Zap,
                            },
                            {
                              title: "Flat Tyre Wheel Swap",
                              desc: "On-site replacement with spare tyre",
                              icon: Disc,
                            },
                            {
                              title: "Emergency Fuel Assistance",
                              desc: "Up to 5L delivered directly to vehicle",
                              icon: Fuel,
                            },
                            {
                              title: "Locked Key Retrieval",
                              desc: "Safe retrieval of keys locked inside",
                              icon: KeyRound,
                            },
                            {
                              title: "Minor Mechanical Fix",
                              desc: "On-site minor electrical/mechanical repairs",
                              icon: Wrench,
                            },
                            {
                              title: "Hotel Stay Allowance",
                              desc: `${plan.hotel_accommodation || 0} nights if stranded away from city`,
                              icon: Hotel,
                            },
                            {
                              title: "Alternative Cab Facility",
                              desc: `${plan.cab_service || 0} rides for passenger onward travel`,
                              icon: Car,
                            },
                            {
                              title: "24/7 Helpline & Claims",
                              desc: "Dedicated toll-free priority claim desk",
                              icon: Headphones,
                            },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
                            >
                              <item.icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block text-[11px]">
                                  {item.title}
                                </span>
                                <span className="text-slate-500 text-[10px] block leading-tight">
                                  {item.desc}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Collapse Button so user doesn't need to scroll up if at the bottom */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(plan.id)}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <span>Hide Details</span>
                        <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Package Details Big Screen Modal ── */}
      <Modal
        isOpen={Boolean(viewingDetailPlan)}
        onClose={() => setViewingDetailPlan(null)}
        title={viewingDetailPlan ? viewingDetailPlan.name : "Package Details"}
        description={`${getSegmentLabel(segment)} Tier • RSA Specifications`}
        maxWidth="2xl"
      >
        {viewingDetailPlan && (
          <div className="space-y-3 pt-0.5">
            {/* Header Mini Strip: Badges + Price */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="secondary" className="text-[10px] py-0 px-2 font-bold">
                  {getSegmentLabel(segment)} Tier
                </Badge>
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" />
                  {viewingDetailPlan.plan_period_months
                    ? `${viewingDetailPlan.plan_period_months} Months`
                    : "12 Months"}{" "}
                  Coverage
                </span>
              </div>

              <div className="text-right">
                <span className="text-base sm:text-lg font-black text-slate-900">
                  {formatCurrency(
                    viewingDetailPlan.resolved_price || viewingDetailPlan.base_price || 0
                  )}
                </span>
              </div>
            </div>

            {/* 4 Stats Compact Strip */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                  Incidents
                </span>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                  {viewingDetailPlan.incidents || "Unlimited"}
                </strong>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                  Towing
                </span>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                  {viewingDetailPlan.distance_km ? `${viewingDetailPlan.distance_km} km` : "50 km"}
                </strong>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                  Hotel
                </span>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                  {viewingDetailPlan.hotel_accommodation || 0}N
                </strong>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                  Cab
                </span>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                  {viewingDetailPlan.cab_service || 0} Rides
                </strong>
              </div>
            </div>

            {/* Roadside Inclusions Compact Grid */}
            <div className="rounded-xl border border-slate-200/80 p-2 sm:p-2.5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Included Roadside Services
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 sm:max-h-56 overflow-y-auto pr-0.5">
                {[
                  {
                    title: "Breakdown Towing",
                    desc: `Up to ${viewingDetailPlan.distance_km || 50} km free`,
                    icon: Navigation,
                  },
                  {
                    title: "Battery Jumpstart",
                    desc: "On-site battery boost",
                    icon: Zap,
                  },
                  {
                    title: "Flat Tyre Puncture",
                    desc: "Spare wheel replacement",
                    icon: Disc,
                  },
                  {
                    title: "Emergency Fuel",
                    desc: "Up to 5L delivered",
                    icon: Fuel,
                  },
                  {
                    title: "Key Lockout",
                    desc: "Locked vehicle key retrieval",
                    icon: KeyRound,
                  },
                  {
                    title: "Minor Mechanical Fix",
                    desc: "On-site troubleshooting",
                    icon: Wrench,
                  },
                  {
                    title: "Hotel Stay Allowance",
                    desc: `${viewingDetailPlan.hotel_accommodation || 0}N if stranded away`,
                    icon: Hotel,
                  },
                  {
                    title: "Alternative Cab",
                    desc: `${viewingDetailPlan.cab_service || 0} rides for travel`,
                    icon: Car,
                  },
                  {
                    title: "Nationwide Coverage",
                    desc: "Highways & cities pan-India",
                    icon: MapPin,
                  },
                  {
                    title: "24/7 Helpline",
                    desc: "Priority dealer claim desk",
                    icon: Headphones,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 py-1 px-2 rounded-lg bg-slate-50/80 border border-slate-200/60 text-xs"
                  >
                    <item.icon className="h-3 w-3 text-primary shrink-0" />
                    <span className="font-semibold text-slate-800 text-[11px] truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto shrink-0 truncate">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setViewingDetailPlan(null)}
                className="h-8 text-xs font-bold px-3 cursor-pointer"
              >
                Close
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={() => {
                  const plan = viewingDetailPlan;
                  setViewingDetailPlan(null);
                  openCheckoutModal(plan);
                }}
                className="h-8 font-bold gap-1 text-xs px-3.5 rounded-xl cursor-pointer"
              >
                Activate Plan <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Checkout Modal ── */}
      <Modal
        isOpen={Boolean(selectedPlan)}
        onClose={resetModalState}
        title={`Activate ${selectedPlan?.name}`}
        description={`Tier: ${getSegmentLabel(segment)} | Price: ${formatCurrency(selectedPlan?.resolved_price || 0)}${dealerPayoutPercentage > 0 ? ` • Your Payout (${dealerPayoutPercentage}%): ${formatCurrency(Math.round((((selectedPlan?.resolved_price || 0) * dealerPayoutPercentage) / 100) * 100) / 100)}` : ""}`}
        maxWidth="4xl"
      >
        <form onSubmit={handleCheckout} className="pt-2 max-h-[78vh] overflow-y-auto px-1 flex flex-col">
          {/* Progress Bar with Labels */}
          <div className="flex items-center gap-2 mb-6">
            {[
              { step: 1, label: "Vehicle" },
              { step: 2, label: "Customer" },
              { step: 3, label: "Address" },
              { step: 4, label: "Images" },
            ].map(({ step, label }) => (
              <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-full h-2 rounded-full transition-all duration-300 ${currentStep >= step ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-slate-100'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= step ? 'text-primary' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Step Header */}
          <div className="mb-8 pb-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {currentStep === 1 && "Vehicle Details"}
              {currentStep === 2 && "Customer Details"}
              {currentStep === 3 && "Address Details"}
              {currentStep === 4 && "Inspection Images"}
            </h2>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
              Step {currentStep} of 4
            </div>
          </div>

          <div className="flex-1 space-y-5">
            {/* ── Step 1: Vehicle Details ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                {!isVehicleFetched && !isManualOverride ? (
                  /* Initial State: Only show Number Plate & Fetch Action (No extra card) */
                  <div className="space-y-4">
                    <div className="w-full space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Registration Number *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="e.g. MH01AB1234"
                            value={formData.regNumber}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                regNumber: e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
                              });
                              if (errors.regNumber) setErrors((prev) => ({ ...prev, regNumber: "" }));
                              setVehicleFetchError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleFetchVehicleRc();
                              }
                            }}
                            className={cn(
                              "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm uppercase tracking-wider font-semibold text-slate-900 transition-colors placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                              errors.regNumber && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleFetchVehicleRc}
                          isLoading={isFetchingVehicle}
                          className="h-11 px-6 font-bold rounded-xl shadow-sm cursor-pointer shrink-0 bg-primary hover:bg-secondary text-white w-full sm:w-auto"
                        >
                          Fetch Details <Sparkles className="h-4 w-4 ml-1.5" />
                        </Button>
                      </div>
                      {errors.regNumber && <p className="text-xs text-red-600 font-medium">{errors.regNumber}</p>}
                    </div>

                    {/* Quick helper for manual override */}
                    <div className="flex items-center justify-end text-xs text-slate-500 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualOverride(true);
                          setIsVehicleFetched(true);
                          if (!formData.regNumber.trim()) {
                            setErrors((prev) => ({ ...prev, regNumber: "Registration number is required" }));
                          }
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                      >
                        Skip to Manual Entry
                      </button>
                    </div>

                    {vehicleFetchError && (
                      <div
                        className={cn(
                          "p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
                          vehicleFetchError.toLowerCase().includes("commercial")
                            ? "bg-red-50/90 border-red-200 text-red-900"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertCircle
                            className={cn(
                              "h-4 w-4 shrink-0 mt-0.5",
                              vehicleFetchError.toLowerCase().includes("commercial")
                                ? "text-red-600"
                                : "text-amber-600"
                            )}
                          />
                          <div className="space-y-0.5">
                            {vehicleFetchError.toLowerCase().includes("commercial") && (
                              <p className="font-bold text-red-950">Commercial Vehicle Notice</p>
                            )}
                            <p className="leading-snug">{vehicleFetchError}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualOverride(true);
                              setIsVehicleFetched(true);
                              if (!formData.regNumber.trim()) {
                                setErrors((prev) => ({ ...prev, regNumber: "Registration number is required" }));
                              }
                            }}
                            className={cn(
                              "text-xs font-bold underline cursor-pointer px-1 whitespace-nowrap",
                              vehicleFetchError.toLowerCase().includes("commercial")
                                ? "text-red-700 hover:text-red-950"
                                : "text-amber-900 hover:text-black"
                            )}
                          >
                            Manual Entry
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fetched State: Show existing fields as in image, marked Read-Only */
                  <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
                    {/* Verified Strip Banner */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-emerald-800">
                          {isManualOverride ? "Manual Vehicle Entry" : "Vehicle RC Verified via Cashfree / VAHAN"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsVehicleFetched(false);
                          setIsManualOverride(false);
                          setVehicleFetchError(null);
                          if (errors.regNumber) setErrors((prev) => ({ ...prev, regNumber: "" }));
                        }}
                        className="text-xs font-bold text-primary hover:text-secondary underline cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <RotateCcw className="h-3 w-3" /> Change Number
                      </button>
                    </div>

                    {/* Registration Number Field */}
                    <Input
                      label="Registration Number *"
                      placeholder="e.g. MH01AB1234"
                      value={formData.regNumber}
                      readOnly={!isManualOverride}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          regNumber: e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
                        });
                        if (errors.regNumber) setErrors((prev) => ({ ...prev, regNumber: "" }));
                      }}
                      className={
                        !isManualOverride
                          ? "bg-slate-100/80 text-slate-700 cursor-not-allowed font-bold uppercase select-none border-slate-200"
                          : "font-bold uppercase"
                      }
                      error={errors.regNumber}
                    />

                    {/* Make & Model (2 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <Input
                        label="Make *"
                        placeholder="e.g. Maruti Suzuki, Hyundai"
                        value={formData.make}
                        readOnly={!isManualOverride}
                        onChange={(e) => {
                          setFormData({ ...formData, make: e.target.value });
                          if (errors.make) setErrors((prev) => ({ ...prev, make: "" }));
                        }}
                        className={!isManualOverride ? "bg-slate-100/80 text-slate-700 cursor-not-allowed font-medium select-none border-slate-200" : ""}
                        error={errors.make}
                      />
                      <Input
                        label="Model *"
                        placeholder="e.g. Swift, Creta, i20"
                        value={formData.model}
                        readOnly={!isManualOverride}
                        onChange={(e) => {
                          setFormData({ ...formData, model: e.target.value });
                          if (errors.model) setErrors((prev) => ({ ...prev, model: "" }));
                        }}
                        className={!isManualOverride ? "bg-slate-100/80 text-slate-700 cursor-not-allowed font-medium select-none border-slate-200" : ""}
                        error={errors.model}
                      />
                    </div>

                    {/* Fuel Type & Transmission (2 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div className="w-full space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Fuel Type *
                        </label>
                        <select
                          disabled={!isManualOverride}
                          className={`flex h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            !isManualOverride ? "bg-slate-100/80 cursor-not-allowed font-medium select-none opacity-90" : "bg-white text-slate-900"
                          }`}
                          value={formData.fuelType}
                          onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                        >
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                          <option value="CNG">CNG</option>
                          <option value="Electric">Electric</option>
                        </select>
                      </div>
                      <div className="w-full space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Transmission *
                        </label>
                        <select
                          disabled={!isManualOverride}
                          className={`flex h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            !isManualOverride ? "bg-slate-100/80 cursor-not-allowed font-medium select-none opacity-90" : "bg-white text-slate-900"
                          }`}
                          value={formData.transmissionType}
                          onChange={(e) => setFormData({ ...formData, transmissionType: e.target.value })}
                        >
                          <option value="Manual">Manual</option>
                          <option value="Automatic">Automatic</option>
                        </select>
                      </div>
                    </div>

                    {/* Registration Year & Odometer Reading (2 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <Input
                        label="Registration Year *"
                        placeholder="e.g. 2024"
                        type="text"
                        inputMode="numeric"
                        value={formData.registrationYear ? String(formData.registrationYear) : ""}
                        readOnly={!isManualOverride}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                          setFormData({ ...formData, registrationYear: Number(val) || 0 });
                          if (errors.registrationYear) setErrors((prev) => ({ ...prev, registrationYear: "" }));
                        }}
                        className={!isManualOverride ? "bg-slate-100/80 text-slate-700 cursor-not-allowed font-medium select-none border-slate-200" : ""}
                        error={errors.registrationYear}
                      />
                      <Input
                        label="Odometer Reading (km) *"
                        placeholder="e.g. 25000"
                        type="text"
                        inputMode="numeric"
                        value={formData.odometerReading}
                        onChange={(e) => {
                          const cleanNum = e.target.value.replace(/[^0-9]/g, "");
                          setFormData({ ...formData, odometerReading: cleanNum });
                          if (errors.odometerReading) setErrors((prev) => ({ ...prev, odometerReading: "" }));
                        }}
                        error={errors.odometerReading}
                      />
                    </div>

                    {/* Chassis Number */}
                    <Input
                      label="Chassis Number *"
                      placeholder="e.g. MA3FJEB1S00123456"
                      value={formData.chassisNumber}
                      readOnly={!isManualOverride}
                      onChange={(e) => {
                        setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() });
                        if (errors.chassisNumber) setErrors((prev) => ({ ...prev, chassisNumber: "" }));
                      }}
                      className={!isManualOverride ? "bg-slate-100/80 text-slate-700 cursor-not-allowed font-medium font-mono select-none border-slate-200" : ""}
                      error={errors.chassisNumber}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Customer Details ── */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.name}
                  onChange={e => { setFormData({...formData, name: e.target.value}); if (errors.name) setErrors(prev => ({...prev, name: ''})); }}
                  error={errors.name}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Mobile Number *"
                    placeholder="e.g. 9876543210"
                    type="tel"
                    maxLength={10}
                    value={formData.number}
                    onChange={e => { setFormData({...formData, number: e.target.value.replace(/\D/g, '')}); if (errors.number) setErrors(prev => ({...prev, number: ''})); }}
                    error={errors.number}
                  />
                  <Input
                    label="Alternate Number"
                    placeholder="e.g. 9123456780 (optional)"
                    type="tel"
                    maxLength={10}
                    value={formData.altNumber}
                    onChange={e => { setFormData({...formData, altNumber: e.target.value.replace(/\D/g, '')}); if (errors.altNumber) setErrors(prev => ({...prev, altNumber: ''})); }}
                    error={errors.altNumber}
                  />
                </div>
                <Input
                  label="Email Address *"
                  placeholder="e.g. customer@email.com"
                  type="email"
                  value={formData.email}
                  onChange={e => { setFormData({...formData, email: e.target.value}); if (errors.email) setErrors(prev => ({...prev, email: ''})); }}
                  error={errors.email}
                />
              </div>
            )}

            {/* ── Step 3: Address ── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Building / Society"
                    placeholder="e.g. Tower B, Prestige Lakeside"
                    value={formData.building}
                    onChange={e => setFormData({...formData, building: e.target.value})}
                  />
                  <Input
                    label="Block / Wing"
                    placeholder="e.g. Wing A, Block 3"
                    value={formData.block}
                    onChange={e => setFormData({...formData, block: e.target.value})}
                  />
                </div>
                <Input
                  label="Road / Street"
                  placeholder="e.g. MG Road, Sector 17"
                  value={formData.road}
                  onChange={e => setFormData({...formData, road: e.target.value})}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Input
                    label="City *"
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={e => { setFormData({...formData, city: e.target.value}); if (errors.city) setErrors(prev => ({...prev, city: ''})); }}
                    error={errors.city}
                  />
                  <Input
                    label="State *"
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={e => { setFormData({...formData, state: e.target.value}); if (errors.state) setErrors(prev => ({...prev, state: ''})); }}
                    error={errors.state}
                  />
                  <Input
                    label="Pincode *"
                    placeholder="e.g. 400001"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={e => { setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')}); if (errors.pincode) setErrors(prev => ({...prev, pincode: ''})); }}
                    error={errors.pincode}
                  />
                </div>
                <Input
                  label="GST Number"
                  placeholder="e.g. 27AABCT1234F1ZH (optional)"
                  value={formData.gstNumber}
                  onChange={e => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
                />
              </div>
            )}

            {/* ── Step 4: Inspection Images ── */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">Upload Vehicle Photos</h3>
                      <Badge variant="secondary" className="text-[10px] text-slate-600 font-semibold">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload photos now as Dealer, or skip to allow Customer to upload later
                    </p>
                  </div>
                  {geoData ? (
                    <Badge variant="success" className="text-[10px]">
                      <MapPin className="h-3 w-3 mr-1" /> Geo-tagged
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] text-slate-500">
                      <MapPin className="h-3 w-3 mr-1" /> Awaiting Image
                    </Badge>
                  )}
                </div>

                {Object.keys(errors).some(k => ['front','rear','left','right','odometer'].includes(k)) && (
                  <div className="flex items-center justify-between text-xs text-red-600 font-medium bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
                    <span>If uploading photos now, please provide all 5 inspection photos, or clear them to allow customer upload.</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearAllFiles();
                        setErrors(prev => {
                          const clean = { ...prev };
                          delete clean.front;
                          delete clean.rear;
                          delete clean.left;
                          delete clean.right;
                          delete clean.odometer;
                          return clean;
                        });
                      }}
                      className="ml-3 text-red-700 underline font-bold hover:text-red-900 cursor-pointer shrink-0"
                    >
                      Clear Photos
                    </button>
                  </div>
                )}
                {Boolean(files.front || files.rear || files.left || files.right || files.odometer) && !Object.keys(errors).some(k => ['front','rear','left','right','odometer'].includes(k)) && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-xs text-blue-700">
                    <span className="font-medium">Photos uploaded by Dealer</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearAllFiles();
                      }}
                      className="font-bold underline hover:text-blue-900 cursor-pointer"
                    >
                      Clear & Leave for Customer Upload
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { key: 'front', label: 'Front View' },
                    { key: 'rear', label: 'Rear View' },
                    { key: 'left', label: 'Left Side' },
                    { key: 'right', label: 'Right Side' },
                    { key: 'odometer', label: 'Odometer' },
                  ].map((img) => {
                    const hasFile = Boolean(files[img.key as keyof typeof files]);
                    const previewUrl = filePreviews[img.key as keyof typeof filePreviews];
                    const hasError = Boolean(errors[img.key]);

                    return (
                      <div key={img.key} className="relative">
                        <label
                          className={`relative flex flex-col items-center justify-center h-28 sm:h-32 border-2 rounded-xl cursor-pointer transition-all overflow-hidden ${
                            hasFile
                              ? 'border-primary ring-2 ring-primary/25 shadow-md bg-slate-900'
                              : hasError
                                ? 'border-dashed border-red-400 bg-red-50/50 hover:bg-red-50'
                                : 'border-dashed border-slate-300 hover:border-primary/60 hover:bg-slate-50'
                          }`}
                        >
                          {hasFile && previewUrl ? (
                            <div className="relative w-full h-full group">
                              <img
                                src={previewUrl}
                                alt={img.label}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                              {/* Overlay at bottom */}
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1.5 px-2 flex items-center justify-between">
                                <span className="text-[10px] sm:text-[11px] font-bold text-white drop-shadow truncate">
                                  {img.label}
                                </span>
                                <span className="text-[9px] font-medium text-blue-200 group-hover:underline">
                                  Change
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-2 text-center">
                              <Camera
                                className={`h-7 w-7 mb-1.5 transition-colors ${
                                  hasError ? 'text-red-400' : 'text-slate-400'
                                }`}
                              />
                              <span
                                className={`text-[11px] font-bold ${
                                  hasError ? 'text-red-500' : 'text-slate-700'
                                }`}
                              >
                                {img.label}
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">Click to upload</span>
                            </div>
                          )}

                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => {
                              handleFileChange(e, img.key as keyof typeof files);
                              if (errors[img.key]) {
                                setErrors((prev) => ({ ...prev, [img.key]: '' }));
                              }
                            }}
                          />
                        </label>

                        {/* Badges and actions */}
                        {hasFile && (
                          <>
                            {/* Checkmark badge */}
                            <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-white rounded-full shadow" />
                            </div>
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={(e) => removeSingleFile(img.key as keyof typeof files, e)}
                              className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors shadow cursor-pointer"
                              title={`Remove ${img.label}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-3 sticky -bottom-1 bg-white py-3 mt-6 sm:mt-8 z-10">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" className="font-bold w-full sm:w-36 border-slate-200 hover:bg-slate-50 h-11" onClick={() => { setCurrentStep(prev => prev - 1); setErrors({}); }}>
                &#8592; Back
              </Button>
            ) : (
              <Button type="button" variant="outline" className="font-bold w-full sm:w-36 border-slate-200 hover:bg-slate-50 h-11" onClick={resetModalState}>
                Cancel
              </Button>
            )}
            
            <Button type="submit" isLoading={isProcessing} className="font-bold w-full sm:w-52 shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-secondary text-white h-11">
              {currentStep < 4 ? "Next Step \u2192" : "Create Order"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
