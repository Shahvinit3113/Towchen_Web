"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { packagesApi, GeoData } from "@/lib/api/packages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal, { showToast } from "@/lib/swal";
import { LiveCameraModal } from "@/components/ui/live-camera-modal";
import {
  Camera,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Download,
  MapPin,
  Car,
  User,
  Sparkles,
  ExternalLink,
  X,
  FileCheck2,
  Clock,
  Ban,
} from "lucide-react";

interface InspectionDetail {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  vehicle_reg_number: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year?: number;
  plan_name: string;
  status: string;
  is_completed: boolean;
  uploaded_by_dealer: boolean | null;
  package_pdf_url?: string | null;
  link_meta?: {
    token: string;
    expires_at: string;
    is_submitted: boolean;
    submitted_at?: string | null;
    is_expired: boolean;
    is_revoked?: boolean;
    revoked_at?: string | null;
  } | null;
  existing_photos?: {
    front?: string;
    rear?: string;
    left?: string;
    right?: string;
    odometer?: string;
  } | null;
}

export default function CustomerSelfInspectionPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<InspectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 5 inspection photos
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

  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCameraAngle, setActiveCameraAngle] = useState<{
    key: keyof typeof files;
    label: string;
    guide: string;
  } | null>(null);

  useEffect(() => {
    if (orderNumber) {
      loadInspection();
    }
  }, [orderNumber]);

  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [filePreviews]);

  async function loadInspection() {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await packagesApi.getPublicInspection(orderNumber);
      const resolved = data?.data && typeof data.data === 'object' ? data.data : data;
      if (resolved && (resolved.order_number || resolved.id)) {
        setOrder(resolved);
      } else {
        setFetchError(`We couldn't locate vehicle inspection order #${orderNumber}. Please check the link sent by your dealer or contact support.`);
      }
    } catch (err: any) {
      console.error("Failed to load inspection details:", err);
      setFetchError(err.message || "Failed to load vehicle inspection details.");
    } finally {
      setIsLoading(false);
    }
  }

  const captureGeoLocation = () => {
    if (!navigator.geolocation) {
      setGeoData({ latitude: null, longitude: null, captured_at: new Date().toISOString() });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoData({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          captured_at: new Date().toISOString(),
        });
      },
      () => {
        setGeoData({ latitude: null, longitude: null, captured_at: new Date().toISOString() });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLivePhotoCapture = (key: keyof typeof files, file: File) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
    if (filePreviews[key]) {
      URL.revokeObjectURL(filePreviews[key]!);
    }
    setFilePreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    if (!geoData) captureGeoLocation();
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof files
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const now = Date.now();
      // Strict gallery restriction: Reject files older than 3 minutes
      if (selected.lastModified && now - selected.lastModified > 3 * 60 * 1000) {
        showToast("error", "Gallery / saved images are NOT allowed. You must capture a fresh live photo right now with your camera.");
        e.target.value = "";
        return;
      }
      handleLivePhotoCapture(key, selected);
    }
  };

  const removeFile = (key: keyof typeof files, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (filePreviews[key]) {
      URL.revokeObjectURL(filePreviews[key]!);
    }
    setFilePreviews((prev) => ({ ...prev, [key]: null }));
    setFiles((prev) => ({ ...prev, [key]: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missing: Record<string, string> = {};
    if (!files.front) missing.front = "Front photo is required";
    if (!files.rear) missing.rear = "Rear photo is required";
    if (!files.left) missing.left = "Left side photo is required";
    if (!files.right) missing.right = "Right side photo is required";
    if (!files.odometer) missing.odometer = "Odometer reading is required";

    if (Object.keys(missing).length > 0) {
      setErrors(missing);
      showToast("warning", "Please take all 5 inspection photos to activate coverage.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await packagesApi.submitCustomerInspection(
        orderNumber,
        {
          front: files.front!,
          rear: files.rear!,
          left: files.left!,
          right: files.right!,
          odometer: files.odometer!,
        },
        geoData || undefined
      );

      await Swal.fire({
        icon: "success",
        title: "Inspection Verified!",
        html: `
          <div class="space-y-3 pt-1 text-center">
            <div class="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 text-center">
              <p class="text-emerald-950 font-bold text-sm sm:text-base">
                Vehicle photos uploaded successfully
              </p>
              <p class="text-xs sm:text-sm text-emerald-700 mt-1.5 leading-relaxed">
                Your protection package is now <strong>Active</strong>. Your warranty certificate has been generated.
              </p>
            </div>
          </div>
        `,
        confirmButtonText: "Done",
        confirmButtonColor: "#003EF9",
      });

      // Reload to show active completion view
      await loadInspection();
    } catch (err: any) {
      console.error("Submission failed:", err);
      const msg = err.message || "Failed to submit vehicle photos. Please try again.";
      showToast("error", msg);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: msg,
        confirmButtonColor: "#003EF9",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── SKELETON LOADING ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-4 animate-pulse">
          <div className="h-10 w-36 bg-slate-200 rounded-xl mx-auto" />
          <div className="h-44 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-8 bg-slate-200 rounded w-2/3" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="h-72 bg-white rounded-3xl border border-slate-200" />
        </div>
      </div>
    );
  }

  // ── LINK CLOSED / REVOKED ──
  if (order?.link_meta?.is_revoked) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-7 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <Ban className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Inspection Link Closed</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This self-inspection link has been closed or revoked by your dealership partner. Photos can no longer be uploaded through this link.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Vehicle:</span>
              <span className="font-bold">{order.vehicle_make} {order.vehicle_model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reg No:</span>
              <span className="font-mono font-bold">{order.vehicle_reg_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer:</span>
              <span className="font-bold">{order.customer_name}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            If you need to complete the inspection, please contact your dealer to send you a fresh active link.
          </p>
        </div>
      </div>
    );
  }

  // ── LINK EXPIRED ──
  if (order?.link_meta?.is_expired) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-amber-200 rounded-3xl p-7 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Clock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Inspection Link Expired</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            For vehicle security and authenticity, camera inspection links are valid for 48 hours. This inspection link has expired.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Vehicle:</span>
              <span className="font-bold">{order.vehicle_make} {order.vehicle_model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reg No:</span>
              <span className="font-mono font-bold">{order.vehicle_reg_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer:</span>
              <span className="font-bold">{order.customer_name}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Please ask your dealer partner to generate and share a new inspection link.
          </p>
        </div>
      </div>
    );
  }

  // ── ERROR OR NOT FOUND ──
  if (fetchError || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-7 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Inspection Link Not Found</h2>
          <p className="text-xs text-slate-500">
            {fetchError ||
              `We couldn't locate vehicle inspection order #${orderNumber}. Please check the link sent by your dealer or contact support.`}
          </p>
          <Button
            onClick={loadInspection}
            variant="outline"
            className="font-bold text-xs rounded-xl mx-auto"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  const angles = [
    {
      key: "front" as const,
      label: "Front View",
      guide: "Full front bumper & plate",
    },
    {
      key: "rear" as const,
      label: "Rear View",
      guide: "Complete rear trunk & lights",
    },
    {
      key: "left" as const,
      label: "Left Profile",
      guide: "Driver side & wheels",
    },
    {
      key: "right" as const,
      label: "Right Profile",
      guide: "Passenger side & doors",
    },
    {
      key: "odometer" as const,
      label: "Odometer",
      guide: "Clear odometer reading (km)",
    },
  ];

  const uploadedCount = Object.values(files).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-slate-50 to-white pb-16">
      {/* ── Top Header Brand ── */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#003EF9] flex items-center justify-center shadow-sm shadow-[#003EF9]/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-sm tracking-tight block leading-tight">
                NEXTTOW
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                Vehicle Self-Inspection
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.link_meta?.expires_at && !order.is_completed && (
              <Badge variant="secondary" className="text-[10px] text-blue-700 bg-blue-50 border-blue-200 hidden sm:inline-flex items-center">
                <Clock className="h-3 w-3 mr-1 text-blue-600" />
                Valid 48h
              </Badge>
            )}
            <Badge variant="secondary" className="text-[10px] font-mono font-bold">
              {order.order_number}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {/* ── Vehicle Card ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Protected Vehicle
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                {order.vehicle_make} {order.vehicle_model}
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Customer: <strong className="text-slate-800">{order.customer_name}</strong>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Registration No.
              </span>
              <span className="inline-block mt-0.5 font-mono font-black text-sm sm:text-base text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                {order.vehicle_reg_number}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 text-xs">
            <span className="text-slate-500">Plan: <strong className="text-primary font-bold">{order.plan_name}</strong></span>
            <Badge
              variant={order.is_completed ? "success" : "secondary"}
              className="text-[10px]"
            >
              {order.is_completed ? "Verified & Active" : "Pending Inspection"}
            </Badge>
          </div>
        </div>

        {/* ── CASE 1: ALREADY COMPLETED / ACTIVE ── */}
        {order.is_completed ? (
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Vehicle Inspection Completed!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                All 5 inspection photos have been uploaded and verified. Your roadside assistance coverage is fully active.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-emerald-50/70 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs text-emerald-800 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {order.uploaded_by_dealer === false
                  ? "Uploaded by Customer (Verified)"
                  : "Verified by Dealer"}
              </span>
            </div>

            {order.package_pdf_url && (
              <div className="pt-2">
                <Button
                  onClick={() => window.open(order.package_pdf_url!, "_blank")}
                  className="font-bold text-xs px-6 py-2.5 shadow-md shadow-primary/20 rounded-xl"
                >
                  <Download className="h-4 w-4 mr-1.5" /> Download Warranty Certificate (PDF)
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* ── CASE 2: PENDING UPLOAD (CUSTOMER CAMERA CAPTURE) ── */
          <form onSubmit={handleSubmit} className="space-y-5 pb-28 sm:pb-32">
            {/* Instruction banner */}
            <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#003EF9] text-white shrink-0 mt-0.5 shadow-sm">
                <Camera className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs text-blue-900">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm">Live Camera Capture Only</p>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> Gallery Upload Disabled
                  </span>
                </div>
                <p className="text-blue-700 leading-relaxed text-[11px] sm:text-xs">
                  Tap each box below to launch the live camera viewfinder. Saved images or gallery uploads cannot be added — all 5 angles must be captured live.
                </p>
              </div>
            </div>

            {/* Error summary */}
            {Object.keys(errors).length > 0 && (
              <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 px-4 py-2.5 rounded-2xl">
                Please complete all 5 photos to submit your inspection.
              </div>
            )}

            {/* ── 5 Camera Capture Boxes ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {angles.map((ang) => {
                const hasFile = Boolean(files[ang.key]);
                const previewUrl = filePreviews[ang.key];
                const hasError = Boolean(errors[ang.key]);

                return (
                  <div key={ang.key} className="relative">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveCameraAngle(ang)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveCameraAngle(ang);
                        }
                      }}
                      className={`relative flex flex-col items-center justify-center h-36 sm:h-40 border-2 rounded-2xl cursor-pointer transition-all overflow-hidden select-none ${
                        hasFile
                          ? "border-primary ring-2 ring-primary/25 shadow-md bg-slate-900"
                          : hasError
                          ? "border-dashed border-red-400 bg-red-50/60 hover:bg-red-50"
                          : "border-dashed border-slate-300 hover:border-primary/70 hover:bg-slate-50 bg-white"
                      }`}
                    >
                      {hasFile && previewUrl ? (
                        <div className="relative w-full h-full group">
                          <img
                            src={previewUrl}
                            alt={ang.label}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-white drop-shadow truncate">
                              {ang.label}
                            </span>
                            <span className="text-[9px] font-medium text-blue-200 group-hover:underline">
                              Retake Live
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center space-y-1.5">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              hasError
                                ? "bg-red-100 text-red-600"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            <Camera className="h-5 w-5" />
                          </div>
                          <div>
                            <span
                              className={`text-xs font-bold block ${
                                hasError ? "text-red-600" : "text-slate-800"
                              }`}
                            >
                              {ang.label}
                            </span>
                            <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                              {ang.guide}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[9px] mt-1 font-semibold border-blue-200 text-blue-700 bg-blue-50/50">
                            Live Camera
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Top action badges */}
                    {hasFile && (
                      <>
                        <div className="absolute top-2 left-2 z-10 pointer-events-none">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-white rounded-full shadow" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeFile(ang.key, e)}
                          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/65 text-white hover:bg-red-600 transition-colors shadow cursor-pointer"
                          title={`Remove ${ang.label}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live Camera Viewfinder Modal */}
            {activeCameraAngle && (
              <LiveCameraModal
                isOpen={Boolean(activeCameraAngle)}
                onClose={() => setActiveCameraAngle(null)}
                title={activeCameraAngle.label}
                guideText={activeCameraAngle.guide}
                onCapture={(file) => {
                  handleLivePhotoCapture(activeCameraAngle.key, file);
                  setActiveCameraAngle(null);
                }}
              />
            )}

            {/* Geotag Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>{uploadedCount} of 5 photos taken</span>
              {geoData ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Location captured
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> GPS auto-tagged on capture
                </span>
              )}
            </div>

            {/* Sticky Bottom Bar for Mobile & Desktop */}
            <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-3 px-3 sm:px-4">
              <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center justify-between sm:justify-start gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                        uploadedCount === 5 ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"
                      }`}
                    >
                      {uploadedCount === 5 ? "✓" : uploadedCount}
                    </span>
                    <span className={uploadedCount === 5 ? "text-emerald-700 font-extrabold" : "text-slate-800"}>
                      {uploadedCount === 5 ? "All 5 Photos Ready!" : `${uploadedCount} of 5 photos captured`}
                    </span>
                  </div>
                  {geoData ? (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> GPS Tagged
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Auto-geotagged</span>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto font-bold text-sm py-3.5 sm:py-3 px-6 sm:px-8 rounded-xl sm:rounded-2xl cursor-pointer transition-all ${
                    uploadedCount === 5
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/40"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                  }`}
                >
                  <FileCheck2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 shrink-0" />
                  <span>Submit Inspection & Activate Coverage</span>
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

