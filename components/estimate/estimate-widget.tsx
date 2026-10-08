"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  towingEstimateSchema,
  TowingEstimateFormData,
} from "@/lib/validations/estimate";
import { towingApi } from "@/lib/api/towing";
import { TowingEstimateResponse, TowingServiceType } from "@/types";
import {
  MapPin,
  Truck,
  BatteryCharging,
  Disc,
  Fuel,
  Key,
  ShieldCheck,
  Wrench,
  ArrowRight,
  Phone,
  Loader2,
  AlertCircle,
  Crosshair,
  Info,
  Smartphone,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddressAutocompleteInput } from "./address-autocomplete-input";

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.99 1.7-0.88 2.73 1.01.08 2.02-.51 2.58-1.23z" />
    </svg>
  );
}

function PlayStoreLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.609 1.814L13.793 12 3.61 22.186c-.37-.367-.61-.88-.61-1.45V3.264c0-.57.24-1.083.609-1.45zm11.27 11.272l2.316 2.317-11.83 6.828 9.514-9.145zm0-2.172L5.365 1.769l11.83 6.828-2.316 2.317zm1.446 1.446l3.541 2.044c.983.568.983 1.488 0 2.056l-3.541 2.044-2.146-2.146 2.146-1.998z" />
    </svg>
  );
}

export interface DynamicServiceOption {
  id: string;
  label: string;
  name: string;
  service_id?: number;
  sub_service_id?: number;
  service_name?: string;
  description?: string;
  base_price?: number;
  base_distance?: number;
  icon: React.ComponentType<{ className?: string }>;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  BatteryCharging,
  Disc,
  Fuel,
  Key,
  ShieldCheck,
  Wrench,
};

const INITIAL_SERVICE_OPTIONS: DynamicServiceOption[] = [
  {
    id: "flatbed",
    name: "Flatbed",
    label: "Flatbed Tow",
    service_id: 1,
    sub_service_id: 1,
    service_name: "Towing",
    icon: Truck,
  },
  {
    id: "underlift",
    name: "Underlift",
    label: "Underlift Tow",
    service_id: 1,
    sub_service_id: 3,
    service_name: "Towing",
    icon: Truck,
  },
  {
    id: "jump_start",
    name: "Jump Start",
    label: "Jump Start",
    service_id: 2,
    sub_service_id: 2,
    service_name: "Technician",
    icon: BatteryCharging,
  },
  {
    id: "mechanic",
    name: "Mechanic",
    label: "Mechanic Repair",
    service_id: 2,
    sub_service_id: 6,
    service_name: "Technician",
    icon: Wrench,
  },
  {
    id: "custodian",
    name: "Custodian",
    label: "Custodian Storage",
    service_id: 3,
    sub_service_id: 7,
    service_name: "Custody",
    icon: Key,
  },
  {
    id: "12_ton",
    name: "12 Ton",
    label: "12 Ton Hydra",
    service_id: 4,
    sub_service_id: 8,
    service_name: "Hydra",
    icon: ShieldCheck,
  },
];


export function EstimateWidget() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<string>("flatbed");
  const [estimate, setEstimate] = useState<TowingEstimateResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [pickupPlaceId, setPickupPlaceId] = useState<string | null>(null);
  const [dropPlaceId, setDropPlaceId] = useState<string | null>(null);

  const handleCheckOnApp = () => {
    if (typeof window === "undefined") return;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || "";
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      window.open("https://apps.apple.com", "_blank");
    } else if (/android/i.test(userAgent)) {
      window.open("https://play.google.com/store", "_blank");
    } else {
      setIsAppModalOpen(true);
    }
  };

  const [serviceOptions, setServiceOptions] = useState<DynamicServiceOption[]>(INITIAL_SERVICE_OPTIONS);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Fetch real services from backend API on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingServices(true);
    towingApi
      .getServices()
      .then((data) => {
        if (!isMounted || !data?.options?.length) return;
        const mapped: DynamicServiceOption[] = data.options.map((opt: any) => {
          const IconComponent = ICON_MAP[opt.icon] || Truck;
          return {
            id: opt.id,
            label: opt.label || opt.name,
            name: opt.name,
            service_id: opt.service_id,
            sub_service_id: opt.sub_service_id,
            service_name: opt.service_name,
            description: opt.description,
            base_price: opt.base_price,
            base_distance: opt.base_distance,
            icon: IconComponent,
          };
        });
        setServiceOptions(mapped);

        const uniqueCats = Array.from(
          new Set(mapped.map((m) => m.service_name).filter(Boolean))
        ) as string[];
        if (uniqueCats.length > 1) {
          setCategories(["All", ...uniqueCats]);
        }

        if (mapped.length > 0 && !mapped.some((m) => m.id === selectedService)) {
          setSelectedService(mapped[0].id);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch backend services, using fallback:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingServices(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TowingEstimateFormData>({
    resolver: zodResolver(towingEstimateSchema) as any,
    defaultValues: {
      pickupLocation: "",
      dropLocation: "",
      vehicleCategory: "suv",
      serviceType: "flatbed",
      requiresSpecialFlatbed: false,
    },
  });


  const pickupValue = watch("pickupLocation");
  const dropValue = watch("dropLocation");

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setValue("pickupLocation", "Current Location", { shouldValidate: true });
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `/api/places/reverse-geocode?lat=${latitude}&lng=${longitude}`
          );
          const data = await res.json();
          if (data && data.address) {
            setValue("pickupLocation", data.address, { shouldValidate: true });
            if (data.place_id) {
              setPickupPlaceId(data.place_id);
            }
          } else {
            setValue(
              "pickupLocation",
              `Near ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Current Location)`,
              { shouldValidate: true }
            );
          }
        } catch (err) {
          console.error("Failed to reverse geocode current position:", err);
          setValue(
            "pickupLocation",
            `Near ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Current Location)`,
            { shouldValidate: true }
          );
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (geoError) => {
        console.warn("Geolocation permission error or timeout:", geoError);
        setIsDetectingLocation(false);
        setValue(
          "pickupLocation",
          "G.I.D.C. Electronic Park, Kolwada Road, Gandhinagar, Gujarat",
          { shouldValidate: true }
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };


  const handleNext = () => {
    if (currentStep === 1) {
      if (!pickupValue?.trim() || !dropValue?.trim()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      calculateEstimate();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setEstimate(null);
      setCalcError(null);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setEstimate(null);
    setCalcError(null);
    setSelectedService(serviceOptions[0]?.id || "flatbed");
  };

  const calculateEstimate = async () => {
    setIsCalculating(true);
    setCalcError(null);
    const selectedOption = serviceOptions.find((s) => s.id === selectedService);
    const baseRate = selectedOption?.base_price || 75;

    const fallbackPrices: Record<string, number> = {
      flatbed: 89,
      flatbed_towing: 89,
      underlift: 79,
      zero_degree: 99,
      "2_wheeler_flatbed": 69,
      jump_start: 59,
      jumpstart: 59,
      mechanic: 75,
      custodian: 120,
      "12_ton": 180,
      "20_ton": 260,
      "25_ton": 350,
    };
    const calculatedPrice = fallbackPrices[selectedService] || baseRate + 14;

    try {
      const result = await towingApi.getEstimate({
        pickupLocation: pickupValue,
        dropLocation: dropValue,
        breakdown_place_id: pickupPlaceId || undefined,
        dropoff_place_id: dropPlaceId || undefined,
        sub_service_id: selectedOption?.sub_service_id,
        vehicleCategory: "suv",
        serviceType: selectedService,
        requiresSpecialFlatbed: selectedService.includes("flatbed"),
      });

      if (result && typeof result.totalEstimatedPrice === "number" && !isNaN(result.totalEstimatedPrice)) {
        setEstimate({
          ...result,
          distanceMiles: result.distanceMiles ?? 3.2,
          distanceKm: result.distanceKm ?? 5.1,
          estimatedEtaMinutes: result.estimatedEtaMinutes ?? 22,
        });
      } else {
        setEstimate({
          distanceMiles: 3.2,
          distanceKm: 5.1,
          baseFare: baseRate,
          distanceFare: 14,
          vehicleCategoryCharge: 0,
          totalEstimatedPrice: calculatedPrice,
          estimatedEtaMinutes: 22,
          serviceType: selectedService,
          vehicleCategory: "suv",
          isApproximate: true,
          breakdown: {
            baseRate,
            perKmRate: 3,
            taxes: 7,
          },
        });
      }
      setCurrentStep(3);
    } catch {
      setEstimate({
        distanceMiles: 3.2,
        distanceKm: 5.1,
        baseFare: baseRate,
        distanceFare: 14,
        vehicleCategoryCharge: 0,
        totalEstimatedPrice: calculatedPrice,
        estimatedEtaMinutes: 22,
        serviceType: selectedService,
        vehicleCategory: "suv",
        isApproximate: true,
        breakdown: {
          baseRate,
          perKmRate: 3,
          taxes: 7,
        },
      });
      setCurrentStep(3);
    } finally {
      setIsCalculating(false);
    }
  };


  const selectedServiceObj =
    serviceOptions.find((s) => s.id === selectedService) || serviceOptions[0] || INITIAL_SERVICE_OPTIONS[0];


  return (
    <div
      id="estimate-calculator"
      className="w-full max-w-[480px] mx-auto text-left"
    >
      <div className="rounded-2xl sm:rounded-[28px] bg-white shadow-xl sm:shadow-2xl border border-slate-100 p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="space-y-1 sm:space-y-1.5">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-600">
            Instant Estimate
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Get Your Towing Estimate
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Approximate pricing, no hidden fees. Know your estimated cost before we arrive.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Step 1 */}
            <div
              className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shrink-0",
                currentStep >= 1
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "bg-blue-50 text-blue-600"
              )}
            >
              1
            </div>

            <div
              className={cn(
                "w-6 sm:w-10 h-0.5 transition-colors",
                currentStep >= 2 ? "bg-blue-600" : "bg-slate-200"
              )}
            />

            {/* Step 2 */}
            <div
              className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shrink-0",
                currentStep >= 2
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "bg-blue-50 text-blue-600"
              )}
            >
              2
            </div>

            <div
              className={cn(
                "w-6 sm:w-10 h-0.5 transition-colors",
                currentStep >= 3 ? "bg-blue-600" : "bg-slate-200"
              )}
            />

            {/* Step 3 */}
            <div
              className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shrink-0",
                currentStep >= 3
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "bg-blue-50 text-blue-600"
              )}
            >
              3
            </div>
          </div>

          <span className="text-xs sm:text-sm font-semibold text-slate-500 ml-1 truncate">
            {currentStep === 1 && "Locations"}
            {currentStep === 2 && "Service"}
            {currentStep === 3 && "Estimate"}
          </span>
        </div>

        {/* Step 1: Location Inputs */}
        {currentStep === 1 && (
          <div className="space-y-4 pt-0.5">
            {/* Pickup */}
            <div className="space-y-1.5">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
                Pickup Location
              </label>
              <AddressAutocompleteInput
                id="pickup-location"
                value={pickupValue || ""}
                onChange={(val) => {
                  setValue("pickupLocation", val, { shouldValidate: true });
                }}
                onSelectPrediction={(prediction) => {
                  setPickupPlaceId(prediction.place_id);
                }}
                placeholder="Enter pickup address or intersection"
                leftIcon={
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 shrink-0 shadow-xs block" />
                }
                rightAction={
                  <button
                    type="button"
                    onClick={handleCurrentLocation}
                    disabled={isDetectingLocation}
                    title="Detect current location"
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  >
                    <Crosshair
                      className={cn(
                        "h-4 w-4",
                        isDetectingLocation && "animate-spin text-blue-600"
                      )}
                    />
                  </button>
                }
                hasError={!!errors.pickupLocation}
              />
              {errors.pickupLocation && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.pickupLocation.message as string}
                </p>
              )}
            </div>

            {/* Drop-off */}
            <div className="space-y-1.5">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
                Drop-Off Location
              </label>
              <AddressAutocompleteInput
                id="drop-location"
                value={dropValue || ""}
                onChange={(val) => {
                  setValue("dropLocation", val, { shouldValidate: true });
                }}
                onSelectPrediction={(prediction) => {
                  setDropPlaceId(prediction.place_id);
                }}
                placeholder="Mechanic, dealership, or any address"
                leftIcon={<MapPin className="w-4 h-4 text-blue-600 shrink-0" />}
                hasError={!!errors.dropLocation}
              />
              {errors.dropLocation && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.dropLocation.message as string}
                </p>
              )}
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={!pickupValue?.trim() || !dropValue?.trim()}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-4 text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] mt-2"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Service Selection */}
        {currentStep === 2 && (
          <div className="space-y-3.5 pt-0.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">
                Select your service type
              </p>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1.5 border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Services
              </span>
            </div>

            {/* Category Filter Tabs */}
            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                      selectedCategory === cat
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Grid of Dynamic Services from Backend */}
            {isLoadingServices && serviceOptions.length === 0 ? (
              <div className="h-[185px] overflow-hidden">
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-[52px] rounded-2xl bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[185px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {(selectedCategory === "All"
                    ? serviceOptions
                    : serviceOptions.filter((s) => s.service_name === selectedCategory)
                  ).map((service) => {
                    const isSelected = selectedService === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedService(service.id)}
                        className={cn(
                          "h-[52px] px-3 rounded-2xl border text-left transition-all relative overflow-hidden group flex flex-col justify-center",
                          isSelected
                            ? "border-2 border-blue-600 bg-blue-50/80 shadow-sm shadow-blue-500/10"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        )}
                      >
                        <div className="min-w-0 w-full">
                          <span
                            className={cn(
                              "text-xs sm:text-sm font-bold truncate block leading-tight",
                              isSelected ? "text-blue-900" : "text-slate-800"
                            )}
                          >
                            {service.label}
                          </span>
                          {service.service_name && (
                            <span
                              className={cn(
                                "text-[10px] font-semibold block truncate mt-0.5",
                                isSelected ? "text-blue-600" : "text-slate-400"
                              )}
                            >
                              {service.service_name}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {calcError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{calcError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isCalculating}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-4 text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 active:scale-[0.99] mt-2"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Calculating Approx. Price...</span>
                </>
              ) : (
                <>
                  <span>Get Estimate</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full text-center text-xs sm:text-sm text-slate-500 hover:text-slate-800 font-semibold transition-colors mt-1"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: Estimate Results */}
        {currentStep === 3 && estimate && (
          <div className="space-y-3.5 pt-0.5">
            {/* Selected Service Tag */}
            <div>
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100/80">
                <span>{selectedServiceObj.label}</span>
                {selectedServiceObj.service_name && (
                  <span className="text-[10px] text-blue-500 font-medium ml-1.5 pl-1.5 border-l border-blue-200">
                    {selectedServiceObj.service_name}
                  </span>
                )}
              </span>
            </div>

            {/* 3 Metric Cards: Distance | Approx Price | ETA */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Distance */}
              <div className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 text-center flex flex-col justify-center min-w-0">
                <p className="text-base sm:text-xl lg:text-2xl font-black text-blue-600 truncate">
                  {estimate.distanceFormatted ||
                    (typeof estimate.distanceMiles === "number" && !isNaN(estimate.distanceMiles)
                      ? `${estimate.distanceMiles}mi`
                      : `${estimate.distanceKm || 5.1}km`)}
                </p>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">
                  Distance
                </p>
              </div>

              {/* Approx Price Card (Featured Blue) */}
              <div className="rounded-2xl bg-blue-600 text-white p-2 sm:p-3 text-center shadow-lg shadow-blue-600/30 flex flex-col justify-center min-w-0">
                <p
                  className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-white truncate"
                  title={estimate.totalEstimatedPriceFormatted || `~$${estimate.totalEstimatedPrice ?? 89}`}
                >
                  {estimate.totalEstimatedPriceFormatted
                    ? estimate.totalEstimatedPriceFormatted.replace(/\.00$/, "")
                    : `~$${estimate.totalEstimatedPrice ?? 89}`}
                </p>
                <p className="text-[9px] sm:text-[11px] font-bold text-blue-100 uppercase tracking-wider mt-1 truncate">
                  Approx. Price
                </p>
              </div>

              {/* ETA */}
              <div className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 text-center flex flex-col justify-center min-w-0">
                <p className="text-base sm:text-xl lg:text-2xl font-black text-blue-600 truncate">
                  {estimate.durationFormatted || `${estimate.estimatedEtaMinutes ?? 22}m`}
                </p>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">
                  ETA
                </p>
              </div>
            </div>

            {/* Route Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3 space-y-2">
              {/* From */}
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1 shadow-xs" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    From
                  </p>
                  <p className="text-xs font-semibold text-slate-800 leading-snug truncate mt-0.5" title={pickupValue}>
                    {pickupValue || "Pickup Location"}
                  </p>
                </div>
              </div>

              {/* Divider connector */}
              <div className="ml-1 pl-2.5 border-l-2 border-slate-200 h-1.5 -my-1" />

              {/* To */}
              <div className="flex items-start gap-2.5 min-w-0">
                <MapPin className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    To
                  </p>
                  <p className="text-xs font-semibold text-slate-800 leading-snug truncate mt-0.5" title={dropValue}>
                    {dropValue || "Drop Destination"}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Booking on App Disclaimer Banner */}
            <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-2.5 text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <span className="leading-tight">
                <strong>Instant Booking:</strong> Confirm this estimate, track your tow driver in real time, and pay securely on the TowChen App.
              </span>
            </div>

            {/* Check on App and App Stores */}
            <div className="space-y-2 pt-0.5">
              <button
                type="button"
                onClick={handleCheckOnApp}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-4 px-4 text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all"
              >
                <Smartphone className="h-4 w-4 shrink-0" />
                <span>Check on App</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] sm:text-xs font-bold transition-all hover:border-slate-300 truncate"
                >
                  <AppleLogo className="h-3.5 w-3.5 fill-current text-slate-900 shrink-0" />
                  <span className="truncate">App Store</span>
                </a>
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] sm:text-xs font-bold transition-all hover:border-slate-300 truncate"
                >
                  <PlayStoreLogo className="h-3.5 w-3.5 fill-current text-slate-900 shrink-0" />
                  <span className="truncate">Play Store</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full text-center text-xs sm:text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors pt-1"
            >
              Start New Estimate
            </button>
          </div>
        )}
      </div>

      {/* App Store / Google Play Modal */}
      {isAppModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAppModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl border border-slate-100 space-y-4 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAppModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                TowChen Mobile App
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track your driver live on GPS, confirm this estimate, and manage roadside assistance 24/7.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-xl bg-slate-900 hover:bg-black text-white py-3 px-4 flex items-center justify-center gap-3 transition-colors shadow-md text-xs sm:text-sm"
              >
                <AppleLogo className="w-4 h-4 fill-current shrink-0" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] text-slate-300">Download on the</p>
                  <p className="font-bold text-white">App Store</p>
                </div>
              </a>

              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-xl bg-slate-900 hover:bg-black text-white py-3 px-4 flex items-center justify-center gap-3 transition-colors shadow-md text-xs sm:text-sm"
              >
                <PlayStoreLogo className="w-4 h-4 fill-current shrink-0" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] text-slate-300">Get it on</p>
                  <p className="font-bold text-white">Google Play</p>
                </div>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsAppModalOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold pt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
