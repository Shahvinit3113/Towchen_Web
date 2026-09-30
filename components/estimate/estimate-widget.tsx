"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  towingEstimateSchema,
  TowingEstimateFormData,
} from "@/lib/validations/estimate";
import { towingApi } from "@/lib/api/towing";
import { TowingEstimateResponse, TowingServiceType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Navigation,
  Truck,
  BatteryCharging,
  Disc,
  Fuel,
  Key,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  PhoneCall,
  Loader2,
  AlertCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICE_OPTIONS: { id: TowingServiceType; label: string; icon: any }[] = [
  {
    id: "flatbed_towing",
    label: "Flatbed Tow",
    icon: Truck,
  },
  {
    id: "jumpstart",
    label: "Jump Start",
    icon: BatteryCharging,
  },
  {
    id: "tire_change",
    label: "Tire Change",
    icon: Disc,
  },
  {
    id: "fuel_delivery",
    label: "Fuel Delivery",
    icon: Fuel,
  },
  {
    id: "lockout",
    label: "Lockout Service",
    icon: Key,
  },
  {
    id: "vehicle_recovery",
    label: "Vehicle Recovery",
    icon: ShieldCheck,
  },
];

const STEP_LABELS = ["Location", "Service", "Estimate"];

export function EstimateWidget() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<TowingServiceType>("flatbed_towing");
  const [estimate, setEstimate] = useState<TowingEstimateResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TowingEstimateFormData>({
    resolver: zodResolver(towingEstimateSchema) as any,
    defaultValues: {
      pickupLocation: "",
      dropLocation: "",
      vehicleCategory: "suv",
      serviceType: "flatbed_towing",
      requiresSpecialFlatbed: false,
    },
  });

  const pickupValue = watch("pickupLocation");
  const dropValue = watch("dropLocation");

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
    setSelectedService("flatbed_towing");
  };

  const calculateEstimate = async () => {
    setIsCalculating(true);
    setCalcError(null);
    try {
      const result = await towingApi.getEstimate({
        pickupLocation: pickupValue,
        dropLocation: dropValue,
        vehicleCategory: "suv",
        serviceType: selectedService,
        requiresSpecialFlatbed: selectedService === "flatbed_towing",
      });
      setEstimate(result);
      setCurrentStep(3);
    } catch {
      setCalcError("Unable to calculate estimate. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const selectedServiceLabel =
    SERVICE_OPTIONS.find((s) => s.id === selectedService)?.label ?? "Service";
  const SelectedServiceIcon =
    SERVICE_OPTIONS.find((s) => s.id === selectedService)?.icon ?? Truck;

  return (
    <div
      id="estimate-calculator"
      className="w-full max-w-lg mx-auto"
    >
      <div className="rounded-2xl sm:rounded-3xl bg-white shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Card Header */}
        <div className="px-5 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
            Instant Estimate
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Get Your Towing Estimate
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-normal">
            Real pricing, no hidden fees. Know your cost before we arrive.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="px-5 pb-4 sm:px-8 sm:pb-6">
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;

              return (
                <React.Fragment key={stepNumber}>
                  {index > 0 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-1",
                        isCompleted ? "bg-primary" : "bg-slate-200"
                      )}
                    />
                  )}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all shrink-0",
                        isActive || isCompleted
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {stepNumber}
                    </div>
                    {(isActive || isCompleted) && (
                      <span className="text-xs sm:text-sm font-medium text-slate-700 hidden sm:inline">
                        {label}
                      </span>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <input
                    {...register("pickupLocation")}
                    placeholder="Enter pickup address..."
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                      errors.pickupLocation
                        ? "border-red-300 bg-red-50/50"
                        : "border-slate-200 bg-white"
                    )}
                  />
                </div>
                {errors.pickupLocation && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.pickupLocation.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Drop Destination
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    {...register("dropLocation")}
                    placeholder="Enter destination address..."
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                      errors.dropLocation
                        ? "border-red-300 bg-red-50/50"
                        : "border-slate-200 bg-white"
                    )}
                  />
                </div>
                {errors.dropLocation && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.dropLocation.message as string}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!pickupValue?.trim() || !dropValue?.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-secondary text-white font-bold py-3.5 text-sm shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2: Service Selection */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <p className="text-sm font-semibold text-slate-700">
                Select your service type
              </p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {SERVICE_OPTIONS.map((service) => {
                  const Icon = service.icon;
                  const isSelected = selectedService === service.id;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedService(service.id)}
                      className={cn(
                        "flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl border-2 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5 shrink-0",
                          isSelected ? "text-primary" : "text-slate-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-semibold truncate",
                          isSelected ? "text-primary" : "text-slate-700"
                        )}
                      >
                        {service.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {calcError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{calcError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isCalculating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-secondary text-white font-bold py-3.5 text-sm shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Calculating...</span>
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
                className="w-full text-center text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Estimate Results */}
          {currentStep === 3 && estimate && (
            <div className="space-y-4 sm:space-y-5">
              {/* Selected Service Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                <SelectedServiceIcon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold">{selectedServiceLabel}</span>
              </div>

              {/* Prominent Estimated Price Card */}
              <div className="rounded-2xl blue-gradient text-white p-4 sm:p-5 text-center shadow-lg shadow-primary/25 space-y-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-100">
                  Estimated Total Price
                </span>
                <p className="text-3xl sm:text-4xl font-black tracking-tight">
                  {formatCurrency(estimate.totalEstimatedPrice)}
                </p>
                <p className="text-[11px] text-blue-100/90 font-medium">
                  Upfront pricing • Zero hidden fees
                </p>
              </div>

              {/* Distance & ETA 2-Column Row */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-xl sm:text-2xl font-black text-slate-900">
                    {estimate.distanceKm}
                    <span className="text-xs font-semibold text-slate-400 ml-0.5">km</span>
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    Trip Distance
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-xl sm:text-2xl font-black text-primary">
                    ~{estimate.estimatedEtaMinutes}
                    <span className="text-xs font-semibold text-slate-400 ml-0.5">m</span>
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    Est. Arrival
                  </p>
                </div>
              </div>

              {/* Route Visualization */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-0 pt-1 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <div className="w-0.5 h-7 bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-white" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        From
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 break-words">
                        {pickupValue || "Pickup Location"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        To
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 break-words">
                        {dropValue || "Drop Destination"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="tel:8005551234"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-secondary text-white font-bold py-3.5 sm:py-4 px-4 text-sm sm:text-base shadow-lg shadow-primary/25 transition-all active:scale-95"
              >
                <PhoneCall className="h-4 w-4 shrink-0" />
                <span className="truncate">CALL NOW — Book Estimate</span>
              </a>

              <button
                type="button"
                onClick={handleReset}
                className="w-full text-center text-xs sm:text-sm text-slate-500 hover:text-slate-800 font-semibold transition-colors flex items-center justify-center gap-1.5 pt-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Start New Estimate</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
