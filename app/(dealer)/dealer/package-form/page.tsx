"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { packagesApi } from "@/lib/api/packages";
import { dealerApi } from "@/lib/api/dealer";
import { vehiclesApi } from "@/lib/api/vehicles";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  MapPin,
  Clock,
  Car,
  Hotel,
  Navigation,
  ChevronDown,
  Wrench,
  Zap,
  Disc,
  Fuel,
  KeyRound,
  Headphones,
  Sparkles,
  X,
  RotateCcw,
  Loader2,
  Check,
  FileText,
  User,
  ShieldCheck,
} from "lucide-react";
import {
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

export default function DealerPackageFormPage() {
  const router = useRouter();

  // Current Step (1: Vehicle, 2: Customer, 3: Address, 4: Photos, 5: Package Selection)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cashfree Vehicle RC fetch state
  const [isVehicleFetched, setIsVehicleFetched] = useState(false);
  const [isFetchingVehicle, setIsFetchingVehicle] = useState(false);
  const [vehicleFetchError, setVehicleFetchError] = useState<string | null>(null);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Inspection Photos
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

  // Step 5: Package Plan Selection State
  const [selectedSegment, setSelectedSegment] = useState<string>("Basic");
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [dealerPayoutPercentage, setDealerPayoutPercentage] = useState<number>(0);
  const [expandedPlanId, setExpandedPlanId] = useState<number | string | null>(null);

  // Submission State
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch Dealer Commission
  useEffect(() => {
    dealerApi.getAccountDetails().then((dealer) => {
      if (dealer && dealer.payout_percentage !== undefined) {
        setDealerPayoutPercentage(Number(dealer.payout_percentage));
      }
    }).catch(() => {});
  }, []);

  // Fetch Plans when entering Step 5 or changing segment
  useEffect(() => {
    if (currentStep === 5) {
      loadPlans(selectedSegment);
    }
  }, [currentStep, selectedSegment]);

  async function loadPlans(seg: string) {
    setIsLoadingPlans(true);
    try {
      const data = await packagesApi.getDealerPackagePlans(seg);
      let loadedPlans: any[] = [];
      if (Array.isArray(data)) {
        loadedPlans = data;
      } else if (data && Array.isArray(data.data)) {
        loadedPlans = data.data;
      } else if (data && Array.isArray(data.items)) {
        loadedPlans = data.items;
      }
      setPlans(loadedPlans);

      if (selectedPlan) {
        const matching = loadedPlans.find((p) => p.id === selectedPlan.id);
        if (matching) {
          setSelectedPlan(matching);
        }
      }
    } catch (err) {
      console.error("Failed to load plans:", err);
      setPlans([]);
    } finally {
      setIsLoadingPlans(false);
    }
  }

  // Geolocation Capture
  const captureGeoLocation = () => {
    if (!navigator.geolocation) {
      setGeoData({ latitude: null, longitude: null, captured_at: new Date().toISOString() });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          captured_at: new Date().toISOString(),
        });
      },
      () => {
        setGeoData({ latitude: null, longitude: null, captured_at: new Date().toISOString() });
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
      if (!geoData) captureGeoLocation();
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
    const checkString = [
      rc.vehicle_category,
      rc.vehicle_class,
      rc.class,
      rc.body_type,
      rc.vehicle_type,
      rc.maker_model,
      rc.model,
      rc.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const commercialKeywords = [
      "commercial",
      "goods",
      "carrier",
      "transport",
      "maxicab",
      "maxi cab",
      "stage carriage",
      "contract carriage",
      "taxi",
      "tourist",
      "truck",
      "lorry",
      "tipper",
      "dumper",
      "trailer",
      "tractor",
      "tanker",
      "bus",
      "minibus",
      "mini bus",
      "omni bus",
      "auto rickshaw",
      "three wheeler passenger",
      "three wheeler goods",
      "e-rickshaw",
      "e rickshaw",
      "lgv",
      "hgv",
      "mgv",
      "lcv",
      "hcv",
      "mcv",
    ];

    for (const keyword of commercialKeywords) {
      const regex = new RegExp(`(^|\\b|\\W)${keyword}(\\b|\\W|$)`, "i");
      if (regex.test(checkString)) {
        return {
          isCommercial: true,
          reason: `Vehicle identified as ${keyword.toUpperCase()} (${rc.vehicle_category || rc.class || "Commercial Class"})`,
        };
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

      const commercialCheck = checkIsCommercialRc(rc);
      if (commercialCheck.isCommercial) {
        const reasonMsg = `This vehicle (${regNo}) is registered as a Commercial Vehicle (${commercialCheck.reason}). Roadside assistance packages cannot be prefilled for commercial vehicles.`;
        setVehicleFetchError(reasonMsg);
        setErrors((prev) => ({
          ...prev,
          regNumber: "Commercial vehicles are not eligible for standard roadside packages.",
        }));
        setIsVehicleFetched(false);
        showToast("error", "Commercial vehicle detected. Auto-fill prevented.");
        return;
      }

      if (rc && (rc.status === "VALID" || rc.reg_no || rc.vehicle_manufacturer_name || rc.chassis || rc.maker)) {
        const rawFuel = (rc.fuel_type || rc.type || "").toUpperCase();
        let normalizedFuel = "Petrol";
        if (rawFuel.includes("DIESEL")) normalizedFuel = "Diesel";
        else if (rawFuel.includes("CNG")) normalizedFuel = "CNG";
        else if (rawFuel.includes("ELEC") || rawFuel.includes("BATTERY") || rawFuel.includes("EV")) normalizedFuel = "Electric";

        let year = new Date().getFullYear();
        if (rc.reg_date || rc.registration_date) {
          const matchedYear = String(rc.reg_date || rc.registration_date).match(/\d{4}/);
          if (matchedYear) {
            year = parseInt(matchedYear[0], 10);
          }
        } else if (rc.mfg_year) {
          year = Number(rc.mfg_year) || year;
        }

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
        "Failed to fetch vehicle RC details. Check internet connection or try manual entry.";
      setVehicleFetchError(errMsg);
      setIsVehicleFetched(false);
      showToast("error", errMsg);

      if (errMsg.toLowerCase().includes("commercial")) {
        setErrors((prev) => ({
          ...prev,
          regNumber: errMsg,
        }));
      }

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

    if (step === 5) {
      if (!selectedPlan) {
        newErrors.package = "Please select a roadside assistance package to continue";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1 && !isVehicleFetched && !isManualOverride) {
      await handleFetchVehicleRc();
      return;
    }

    if (!validateStep(currentStep)) return;

    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    await handleSubmitOrder();
  };

  const handleSubmitOrder = async () => {
    if (!selectedPlan) {
      setErrors({ package: "Please select a package before submitting" });
      return;
    }

    setIsProcessing(true);
    try {
      const hasInspectionImages = Boolean(files.front || files.rear || files.left || files.right || files.odometer);
      const payload = {
        customerData: { ...formData },
        vehicleData: { ...formData, odometerReading: Number(formData.odometerReading), carSegment: selectedSegment },
        packageData: {
          planId: selectedPlan.id,
          startDate: new Date().toISOString().split("T")[0],
        },
        files: files,
        geoData: geoData || undefined,
        uploaded_by_dealer: hasInspectionImages,
      };

      const purchase = await packagesApi.submitDealerPackageOrder(payload);

      if (purchase?.status === "PendingInspection") {
        showToast("info", `Order ${purchase?.order_number || ""} saved (Pending Inspection)`);
        const result = await showPendingInspectionModal(purchase?.order_number);
        if (result.isConfirmed) {
          router.push("/dealer/package-history");
        }
      } else {
        showToast("success", `Package ${purchase?.order_number || ""} successfully activated!`);
        const result = await showOrderActiveModal(purchase?.order_number, purchase?.package_pdf_url);
        if (result.isConfirmed) {
          if (purchase?.package_pdf_url) {
            window.open(purchase.package_pdf_url, "_blank");
          } else {
            router.push("/dealer/package-history");
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

  const STEPS = [
    { num: 1, label: "Vehicle", icon: Car },
    { num: 2, label: "Customer", icon: User },
    { num: 3, label: "Address", icon: MapPin },
    { num: 4, label: "Photos", icon: Camera },
    { num: 5, label: "Package", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-8 sm:pb-12 px-1 sm:px-0">
      {/* Page Title & Context Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
          <span>Package Activation Form</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Fill in vehicle & customer details first, then choose and activate the roadside package.
        </p>
      </div>

      {/* Fixed Stepper with Tab Names Below Numbers */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-3.5 shadow-2xs">
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < currentStep) {
                    setCurrentStep(s.num);
                    setErrors({});
                  }
                }}
                disabled={s.num > currentStep}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-xl transition-all text-center",
                  isCurrent
                    ? "bg-primary text-white shadow-2xs font-bold"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer active:scale-95 font-semibold"
                    : "bg-slate-50 text-slate-400 cursor-not-allowed font-medium"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0",
                    isCurrent
                      ? "bg-white text-primary"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  )}
                >
                  {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : s.num}
                </div>
                <span className="text-[10px] sm:text-xs leading-tight tracking-tight truncate max-w-full">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleNext}>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6">
          {/* Step 1: Vehicle Details */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="border-b border-slate-100 pb-3 sm:pb-4">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary shrink-0" />
                  <span>Step 1: Vehicle Information</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter registration number to auto-populate official VAHAN details.
                </p>
              </div>

              {!isVehicleFetched && !isManualOverride ? (
                <div className="space-y-3.5 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Registration Number *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
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
                            "flex h-12 sm:h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-base sm:text-sm uppercase tracking-wider font-bold text-slate-900 transition-colors placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                            errors.regNumber && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleFetchVehicleRc}
                        isLoading={isFetchingVehicle}
                        className="h-12 sm:h-11 px-5 font-bold rounded-xl shadow-xs cursor-pointer shrink-0 bg-primary hover:bg-secondary text-white w-full sm:w-auto text-sm"
                      >
                        Fetch Details <Sparkles className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                    {errors.regNumber && <p className="text-xs text-red-600 font-medium">{errors.regNumber}</p>}
                  </div>

                  {/* Manual entry fallback */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-0.5 gap-1">
                    <span>Don&apos;t have RC handy?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualOverride(true);
                        setIsVehicleFetched(true);
                        if (!formData.regNumber.trim()) {
                          setErrors((prev) => ({ ...prev, regNumber: "Registration number is required" }));
                        }
                      }}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Fill Details Manually &rarr;
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
                            "h-5 w-5 shrink-0 mt-0.5",
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
                          "text-xs font-bold underline cursor-pointer px-1 whitespace-nowrap self-end sm:self-center",
                          vehicleFetchError.toLowerCase().includes("commercial")
                            ? "text-red-700 hover:text-red-950"
                            : "text-amber-900 hover:text-black"
                        )}
                      >
                        Manual Entry
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
                  {/* Verified Strip */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-emerald-800">
                        {isManualOverride ? "Manual Vehicle Entry Mode" : "Vehicle RC Verified via Cashfree / VAHAN"}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
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
                      className={!isManualOverride ? "bg-slate-100/80 text-slate-700 cursor-not-allowed font-bold uppercase select-none border-slate-200 text-base sm:text-sm" : "font-bold uppercase text-base sm:text-sm"}
                      error={errors.regNumber}
                    />

                    <Input
                      label="Make *"
                      placeholder="e.g. Maruti Suzuki, Hyundai"
                      value={formData.make}
                      readOnly={!isManualOverride}
                      onChange={(e) => {
                        setFormData({ ...formData, make: e.target.value });
                        if (errors.make) setErrors((prev) => ({ ...prev, make: "" }));
                      }}
                      className={!isManualOverride ? "bg-slate-100/80 text-slate-700 cursor-not-allowed font-medium select-none border-slate-200 text-base sm:text-sm" : "text-base sm:text-sm"}
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
                      className={!isManualOverride ? "bg-slate-100/80 text-slate-700 cursor-not-allowed font-medium select-none border-slate-200 text-base sm:text-sm" : "text-base sm:text-sm"}
                      error={errors.model}
                    />

                    <div className="w-full space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Fuel Type *
                      </label>
                      <select
                        disabled={!isManualOverride}
                        className={`flex h-12 sm:h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-base sm:text-sm text-slate-700 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
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
                        className={`flex h-12 sm:h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-base sm:text-sm text-slate-700 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          !isManualOverride ? "bg-slate-100/80 cursor-not-allowed font-medium select-none opacity-90" : "bg-white text-slate-900"
                        }`}
                        value={formData.transmissionType}
                        onChange={(e) => setFormData({ ...formData, transmissionType: e.target.value })}
                      >
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                      </select>
                    </div>

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
                      className={!isManualOverride ? "bg-slate-100/80 text-slate-700 cursor-not-allowed font-medium select-none border-slate-200 text-base sm:text-sm" : "text-base sm:text-sm"}
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
                      className="text-base sm:text-sm"
                      error={errors.odometerReading}
                    />

                    <Input
                      label="Chassis Number *"
                      placeholder="e.g. MA3FJEB1S00123456"
                      value={formData.chassisNumber}
                      readOnly={!isManualOverride}
                      onChange={(e) => {
                        setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() });
                        if (errors.chassisNumber) setErrors((prev) => ({ ...prev, chassisNumber: "" }));
                      }}
                      className={!isManualOverride ? "bg-slate-100/80 text-slate-700 cursor-not-allowed font-medium font-mono select-none border-slate-200 text-base sm:text-sm" : "text-base sm:text-sm font-mono"}
                      error={errors.chassisNumber}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Customer Details */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="border-b border-slate-100 pb-3 sm:pb-4">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary shrink-0" />
                  <span>Step 2: Customer Contact Information</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contact details for warranty certificates, renewal alerts, and roadside assistance dispatch.
                </p>
              </div>

              <div className="space-y-3.5 sm:space-y-5 max-w-2xl">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className="text-base sm:text-sm"
                  error={errors.name}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
                  <Input
                    label="Mobile Number *"
                    placeholder="e.g. 9876543210"
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    value={formData.number}
                    onChange={(e) => {
                      setFormData({ ...formData, number: e.target.value.replace(/\D/g, "") });
                      if (errors.number) setErrors((prev) => ({ ...prev, number: "" }));
                    }}
                    className="text-base sm:text-sm"
                    error={errors.number}
                  />
                  <Input
                    label="Alternate Number"
                    placeholder="e.g. 9123456780 (optional)"
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    value={formData.altNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, altNumber: e.target.value.replace(/\D/g, "") });
                      if (errors.altNumber) setErrors((prev) => ({ ...prev, altNumber: "" }));
                    }}
                    className="text-base sm:text-sm"
                    error={errors.altNumber}
                  />
                </div>

                <Input
                  label="Email Address *"
                  placeholder="e.g. customer@email.com"
                  type="email"
                  inputMode="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className="text-base sm:text-sm"
                  error={errors.email}
                />
              </div>
            </div>
          )}

          {/* Step 3: Address & GST */}
          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="border-b border-slate-100 pb-3 sm:pb-4">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <span>Step 3: Residential Address & Tax Details</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Address details for roadside coverage validation and official invoice generation.
                </p>
              </div>

              <div className="space-y-3.5 sm:space-y-5 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
                  <Input
                    label="Building / Society"
                    placeholder="e.g. Tower B, Prestige Lakeside"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="text-base sm:text-sm"
                  />
                  <Input
                    label="Block / Wing"
                    placeholder="e.g. Wing A, Block 3"
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                    className="text-base sm:text-sm"
                  />
                </div>

                <Input
                  label="Road / Street"
                  placeholder="e.g. MG Road, Sector 17"
                  value={formData.road}
                  onChange={(e) => setFormData({ ...formData, road: e.target.value })}
                  className="text-base sm:text-sm"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
                  <Input
                    label="City *"
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                    className="text-base sm:text-sm"
                    error={errors.city}
                  />
                  <Input
                    label="State *"
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
                    }}
                    className="text-base sm:text-sm"
                    error={errors.state}
                  />
                  <Input
                    label="Pincode *"
                    placeholder="e.g. 400001"
                    maxLength={6}
                    inputMode="numeric"
                    value={formData.pincode}
                    onChange={(e) => {
                      setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") });
                      if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: "" }));
                    }}
                    className="text-base sm:text-sm"
                    error={errors.pincode}
                  />
                </div>

                <Input
                  label="GST Number"
                  placeholder="e.g. 27AABCT1234F1ZH (optional)"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  className="text-base sm:text-sm uppercase"
                />
              </div>
            </div>
          )}

          {/* Step 4: Inspection Images */}
          {currentStep === 4 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="border-b border-slate-100 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary shrink-0" />
                    <span>Step 4: Vehicle Inspection Photos</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload photos now, or skip to allow customer to upload them upon delivery.
                  </p>
                </div>
                {geoData ? (
                  <Badge variant="success" className="text-xs py-1 px-2.5 self-start sm:self-auto font-bold">
                    <MapPin className="h-3 w-3 mr-1" /> GPS Coordinates Tagged
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs py-1 px-2.5 text-slate-500 self-start sm:self-auto">
                    <MapPin className="h-3 w-3 mr-1" /> Auto-tagged on capture
                  </Badge>
                )}
              </div>

              {Object.keys(errors).some((k) => ["front", "rear", "left", "right", "odometer"].includes(k)) && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-red-600 font-medium bg-red-50 border border-red-200 p-3 sm:px-4 sm:py-2.5 rounded-xl gap-2">
                  <span>If uploading photos now, please provide all 5 inspection photos, or clear them to allow customer upload.</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFiles();
                      setErrors((prev) => {
                        const clean = { ...prev };
                        delete clean.front;
                        delete clean.rear;
                        delete clean.left;
                        delete clean.right;
                        delete clean.odometer;
                        return clean;
                      });
                    }}
                    className="text-red-700 underline font-bold hover:text-red-900 cursor-pointer shrink-0"
                  >
                    Clear Photos
                  </button>
                </div>
              )}

              {Boolean(files.front || files.rear || files.left || files.right || files.odometer) && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-50 border border-blue-200 p-3 sm:px-4 sm:py-2.5 rounded-xl text-xs text-blue-700 gap-1.5">
                  <span className="font-semibold">Photos attached by Dealer</span>
                  <button
                    type="button"
                    onClick={clearAllFiles}
                    className="font-bold underline hover:text-blue-900 cursor-pointer"
                  >
                    Clear & Leave for Customer Upload
                  </button>
                </div>
              )}

              {/* Photo Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
                {[
                  { key: "front", label: "Front View" },
                  { key: "rear", label: "Rear View" },
                  { key: "left", label: "Left Side" },
                  { key: "right", label: "Right Side" },
                  { key: "odometer", label: "Odometer" },
                ].map((img) => {
                  const hasFile = Boolean(files[img.key as keyof typeof files]);
                  const previewUrl = filePreviews[img.key as keyof typeof filePreviews];
                  const hasError = Boolean(errors[img.key]);

                  return (
                    <div key={img.key} className="relative">
                      <label
                        className={`relative flex flex-col items-center justify-center h-28 sm:h-36 border-2 rounded-2xl cursor-pointer transition-all overflow-hidden ${
                          hasFile
                            ? "border-primary ring-2 ring-primary/25 shadow-md bg-slate-900"
                            : hasError
                            ? "border-dashed border-red-400 bg-red-50/50 hover:bg-red-50"
                            : "border-dashed border-slate-300 hover:border-primary/60 hover:bg-slate-50"
                        }`}
                      >
                        {hasFile && previewUrl ? (
                          <div className="relative w-full h-full group">
                            <img
                              src={previewUrl}
                              alt={img.label}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5 sm:p-2 flex items-center justify-between">
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
                              className={`h-6 w-6 sm:h-7 sm:w-7 mb-1 transition-colors ${
                                hasError ? "text-red-400" : "text-slate-400"
                              }`}
                            />
                            <span
                              className={`text-[11px] sm:text-xs font-bold leading-tight ${
                                hasError ? "text-red-500" : "text-slate-700"
                              }`}
                            >
                              {img.label}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">Upload</span>
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
                              setErrors((prev) => ({ ...prev, [img.key]: "" }));
                            }
                          }}
                        />
                      </label>

                      {hasFile && (
                        <>
                          <div className="absolute top-2 left-2 z-10 pointer-events-none">
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 bg-white rounded-full shadow-xs" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => removeSingleFile(img.key as keyof typeof files, e)}
                            className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
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

          {/* Step 5: Package Plan Selection (THE FINAL STEP!) */}
          {currentStep === 5 && (
            <div className="space-y-3.5 sm:space-y-5">
              {/* Header */}
              <div className="border-b border-slate-100 pb-2.5 sm:pb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    <span>Step 5: Select Roadside Package</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Pick a coverage tier and plan for {formData.regNumber || "vehicle"}.
                  </p>
                </div>
                {dealerPayoutPercentage > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                    {dealerPayoutPercentage}% Payout
                  </span>
                )}
              </div>

              {/* Tier Selection Tabs (Segmented control) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Coverage Tier</span>
                  <span className="text-primary font-semibold lowercase">tap to switch</span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  {CAR_SEGMENTS.map((seg) => (
                    <button
                      key={seg.value}
                      type="button"
                      onClick={() => {
                        setSelectedSegment(seg.value);
                      }}
                      className={cn(
                        "text-center py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
                        selectedSegment === seg.value
                          ? "bg-white text-slate-900 shadow-2xs font-black"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {seg.label}
                    </button>
                  ))}
                </div>
              </div>

              {errors.package && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{errors.package}</span>
                </div>
              )}

              {/* Plans Loading / Cards List */}
              {isLoadingPlans ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span className="text-xs sm:text-sm font-medium">Loading {getSegmentLabel(selectedSegment)} plans...</span>
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                  <p className="text-xs sm:text-sm font-semibold">No plans available for {getSegmentLabel(selectedSegment)} tier.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {plans.map((plan) => {
                    const isSelected = selectedPlan?.id === plan.id;
                    const isExpanded = expandedPlanId === plan.id;
                    const planPrice = plan.resolved_price || plan.base_price || 0;
                    const payoutAmount = dealerPayoutPercentage > 0
                      ? Math.round(((planPrice * dealerPayoutPercentage) / 100) * 100) / 100
                      : 0;

                    return (
                      <div
                        key={plan.id}
                        className={cn(
                          "rounded-xl border transition-all overflow-hidden",
                          isSelected
                            ? "border-primary bg-blue-50/30 ring-2 ring-primary/20 shadow-2xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        {/* Compact Selectable Row */}
                        <div
                          onClick={() => {
                            setSelectedPlan(plan);
                            if (errors.package) setErrors((prev) => ({ ...prev, package: "" }));
                          }}
                          className="flex items-center justify-between p-2.5 sm:p-3 cursor-pointer select-none gap-2"
                        >
                          {/* Left: Radio + Name + Duration */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                isSelected ? "border-primary bg-primary text-white" : "border-slate-300 bg-white"
                              )}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                                  {plan.name}
                                </span>
                                {isSelected && (
                                  <span className="text-[8px] sm:text-[9px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.2 rounded shrink-0">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] sm:text-[11px] text-slate-500">
                                {plan.plan_period_months ? `${plan.plan_period_months} Months` : "12 Months"} Coverage
                              </p>
                            </div>
                          </div>

                          {/* Right: Price + Payout + Accordion Trigger */}
                          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-sm sm:text-base font-black text-slate-900 block leading-tight">
                                {formatCurrency(planPrice)}
                              </span>
                              {payoutAmount > 0 && (
                                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded inline-block">
                                  +{formatCurrency(payoutAmount)}
                                </span>
                              )}
                            </div>

                            {/* Accordion Expand/Collapse Trigger */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedPlanId((prev) => (prev === plan.id ? null : plan.id));
                              }}
                              className={cn(
                                "p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-0.5",
                                isExpanded && "text-primary bg-primary/10"
                              )}
                              title={isExpanded ? "Collapse details" : "View all details"}
                            >
                              <span className="text-[10px] font-bold hidden sm:inline">
                                {isExpanded ? "Hide" : "Details"}
                              </span>
                              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-180")} />
                            </button>
                          </div>
                        </div>

                        {/* Accordion Detailed View */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-2 border-t border-slate-100 bg-slate-50/70 space-y-2.5 animate-in fade-in duration-150">
                            {/* 4 Key Specs Strip */}
                            <div className="grid grid-cols-4 gap-1.5 text-center">
                              <div className="p-1.5 rounded-lg bg-white border border-slate-200/80">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Incidents</span>
                                <strong className="text-[11px] font-bold text-slate-800">{plan.incidents || "Unlimited"}</strong>
                              </div>
                              <div className="p-1.5 rounded-lg bg-white border border-slate-200/80">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Towing</span>
                                <strong className="text-[11px] font-bold text-slate-800">{plan.distance_km ? `${plan.distance_km} km` : "50 km"}</strong>
                              </div>
                              <div className="p-1.5 rounded-lg bg-white border border-slate-200/80">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Hotel</span>
                                <strong className="text-[11px] font-bold text-slate-800">{plan.hotel_accommodation || 0}N</strong>
                              </div>
                              <div className="p-1.5 rounded-lg bg-white border border-slate-200/80">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Cab</span>
                                <strong className="text-[11px] font-bold text-slate-800">{plan.cab_service || 0} Rides</strong>
                              </div>
                            </div>

                            {/* Inclusions Breakdown */}
                            <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-xs text-slate-600 pt-0.5">
                              <div className="flex items-center gap-1.5"><Navigation className="h-3 w-3 text-primary shrink-0" /> Free Towing ({plan.distance_km || 50}km)</div>
                              <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary shrink-0" /> Battery Jumpstart</div>
                              <div className="flex items-center gap-1.5"><Disc className="h-3 w-3 text-primary shrink-0" /> Flat Tyre Fix</div>
                              <div className="flex items-center gap-1.5"><Fuel className="h-3 w-3 text-primary shrink-0" /> Fuel Delivery</div>
                              <div className="flex items-center gap-1.5"><KeyRound className="h-3 w-3 text-primary shrink-0" /> Key Lockout</div>
                              <div className="flex items-center gap-1.5"><Wrench className="h-3 w-3 text-primary shrink-0" /> Minor Repair</div>
                              <div className="flex items-center gap-1.5"><Hotel className="h-3 w-3 text-primary shrink-0" /> Hotel Stay Allowance</div>
                              <div className="flex items-center gap-1.5"><Headphones className="h-3 w-3 text-primary shrink-0" /> 24/7 Priority Support</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Order Summary Strip (High-Density) */}
              {selectedPlan && (
                <div className="rounded-xl border border-primary/20 bg-blue-50/30 p-2.5 sm:p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-primary flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Summary
                    </span>
                    <span className="text-slate-500 font-semibold truncate max-w-[200px]">
                      {formData.regNumber} • {formData.make} {formData.model}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-primary/10">
                    <span className="text-slate-800 truncate">
                      {selectedPlan.name} ({getSegmentLabel(selectedSegment)})
                    </span>
                    <span className="text-emerald-700 font-black shrink-0 pl-2">
                      {formatCurrency(selectedPlan.resolved_price || selectedPlan.base_price || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Action Bar (Normal flow, no floating overlap) */}
          <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-2.5 sm:gap-4 mt-6 sm:mt-8">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                className="font-bold w-full sm:w-36 border-slate-200 hover:bg-slate-50 h-12 sm:h-11 cursor-pointer text-sm"
                onClick={() => {
                  setCurrentStep((prev) => prev - 1);
                  setErrors({});
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="font-bold w-full sm:w-36 border-slate-200 hover:bg-slate-50 h-12 sm:h-11 cursor-pointer text-sm"
                onClick={() => router.push("/dealer/packages")}
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              isLoading={isProcessing}
              className="font-bold w-full sm:w-64 shadow-md sm:shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-secondary text-white h-12 sm:h-11 cursor-pointer text-sm"
            >
              {currentStep < 5 ? (
                <>
                  Next Step <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              ) : (
                <>
                  Confirm & Activate <CheckCircle2 className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
