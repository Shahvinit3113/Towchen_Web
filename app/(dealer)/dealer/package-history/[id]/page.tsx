"use client";
import Swal, { showToast } from "@/lib/swal";
import { GeoData } from "@/lib/api/packages";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { packagesApi } from "@/lib/api/packages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Shield,
  Gauge,
  CreditCard,
  ExternalLink,
  FileText,
  Camera,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Building,
  Layers,
  Fuel,
  Settings,
  X,
  Share2,
  Copy,
  Smartphone,
  Send,
} from "lucide-react";

export default function DealerPackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Inspection Photo Upload State
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
  const [isUploadingInspection, setIsUploadingInspection] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [activeLink, setActiveLink] = useState<any | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFiles((prev) => ({ ...prev, [key]: selected }));
      if (filePreviews[key]) {
        URL.revokeObjectURL(filePreviews[key]!);
      }
      setFilePreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(selected) }));
      if (!geoData) captureGeoLocation();
      setUploadErrors((prev) => {
        const clean = { ...prev };
        delete clean[key];
        return clean;
      });
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
    setUploadErrors({});
  };

  const openInspectionLinkModal = (linkData: any) => {
    if (!linkData?.url || !order) return;
    const url = linkData.url;
    const phone = order.customer?.customer_number || "";
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const customerName = order.customer?.customer_name || "Customer";
    const vehicleName = `${order.vehicle?.vehicle_make || ""} ${order.vehicle?.vehicle_model || ""}`.trim();
    const regNo = order.vehicle?.vehicle_reg_number || "";

    const expiresFormatted = linkData.expires_at
      ? new Date(linkData.expires_at).toLocaleString("en-IN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "48 hours";

    const isSubmitted = Boolean(linkData.is_submitted);
    const isExpired = Boolean(linkData.is_expired || (linkData.expires_at && new Date() > new Date(linkData.expires_at)));

    const message = encodeURIComponent(
      `Hello ${customerName},\n\nPlease complete your vehicle inspection for ${vehicleName} (${regNo}) by capturing 5 vehicle photos using your mobile camera at this encrypted link:\n${url}\n\n• Link valid until: ${expiresFormatted}\n• Once submitted, your protection coverage will be activated immediately.`
    );
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`
      : `https://api.whatsapp.com/send?text=${message}`;

    Swal.fire({
      title: "Encrypted Customer Inspection Link",
      html: `
        <div class="space-y-3.5 pt-1 text-center">
          <div class="flex flex-wrap items-center justify-center gap-2">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
              isSubmitted
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : isExpired
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }">
              ${isSubmitted ? "✓ Photos Submitted" : isExpired ? "⚠ Link Expired" : "● Awaiting Customer Capture"}
            </span>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Expires: ${expiresFormatted}
            </span>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 text-left">
            Share this encrypted camera link with <strong>${customerName}</strong>. The package ID is fully encrypted to prevent unauthorized access.
          </p>

          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-2 text-left">
            <span class="font-mono text-[11px] text-slate-800 break-all select-all">${url}</span>
            <button id="swal-copy-btn" class="shrink-0 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs cursor-pointer transition-colors">
              Copy Link
            </button>
          </div>

          <div class="pt-1 flex flex-col sm:flex-row gap-2">
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="w-full text-center py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors">
              <span>Share via WhatsApp</span>
            </a>
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="w-full text-center py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-colors">
              <span>Preview Link</span>
            </a>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        const btn = document.getElementById("swal-copy-btn");
        if (btn) {
          btn.addEventListener("click", () => {
            navigator.clipboard?.writeText(url);
            btn.innerText = "Copied!";
            setTimeout(() => {
              if (btn) btn.innerText = "Copy Link";
            }, 2000);
          });
        }
      },
    });
  };

  const handleCreateInspectionLink = async () => {
    if (!order?.id) return;
    setIsCreatingLink(true);
    try {
      const link = await packagesApi.createInspectionLink(order.id);
      setActiveLink(link);
      showToast("success", "Encrypted inspection link generated!");
      openInspectionLinkModal(link);
    } catch (err: any) {
      console.error("Failed to generate link:", err);
      const msg = err.message || "Failed to create customer inspection link.";
      showToast("error", msg);
      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text: msg,
        confirmButtonColor: "#003EF9",
      });
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleUploadInspection = async () => {
    const missing: Record<string, string> = {};
    if (!files.front) missing.front = "Front photo required";
    if (!files.rear) missing.rear = "Rear photo required";
    if (!files.left) missing.left = "Left side photo required";
    if (!files.right) missing.right = "Right side photo required";
    if (!files.odometer) missing.odometer = "Odometer photo required";

    if (Object.keys(missing).length > 0) {
      setUploadErrors(missing);
      showToast("warning", "Please upload all 5 inspection photos to activate coverage.");
      return;
    }

    setIsUploadingInspection(true);
    try {
      await packagesApi.uploadInspectionImages(
        order.id,
        {
          front: files.front!,
          rear: files.rear!,
          left: files.left!,
          right: files.right!,
          odometer: files.odometer!,
        },
        geoData || undefined,
        true
      );

      clearAllFiles();
      showToast("success", "Inspection photos uploaded successfully!");
      await Swal.fire({
        icon: "success",
        title: "Inspection Verified!",
        html: `
          <div class="space-y-3 pt-1 text-center">
            <div class="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 text-center">
              <p class="text-emerald-950 font-bold text-sm sm:text-base">Photos uploaded by Dealer</p>
              <p class="text-xs sm:text-sm text-emerald-700 mt-1.5 leading-relaxed">
                Package order status is now <strong>Active</strong> and the official certificate has been generated.
              </p>
            </div>
          </div>
        `,
        confirmButtonText: "Done",
        confirmButtonColor: "#003EF9",
      });

      await loadOrderDetail();
    } catch (err: any) {
      console.error("Upload inspection failed:", err);
      const msg = err.message || "Failed to upload inspection photos.";
      showToast("error", msg);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: msg,
        confirmButtonColor: "#003EF9",
      });
    } finally {
      setIsUploadingInspection(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  async function loadOrderDetail() {
    setIsLoading(true);
    try {
      const data = await packagesApi.getDealerPackageOrderDetail(orderId);
      setOrder(data);
      try {
        const linkData = await packagesApi.getInspectionLink(orderId);
        setActiveLink(linkData);
      } catch (e) {
        // Non-blocking
      }
    } catch (err) {
      console.error("Failed to load order details:", err);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = async () => {
    if (!order?.id) return;
    setDownloading(true);
    try {
      const url = await packagesApi.getCertificateDownloadUrl(order.id);
      if (url) {
        window.open(url, "_blank");
      } else {
        showToast("warning", "Certificate download URL is not available.");
      }
    } catch (err) {
      showToast("error", "Failed to download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        {/* Skeleton Header */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48" />
          <div className="h-4 bg-slate-200 rounded w-72" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Package Order Not Found</h2>
        <p className="text-sm text-slate-500">
          We couldn't find the requested package order with ID "{orderId}".
        </p>
        <Link
          href="/dealer/package-history"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Package History</span>
        </Link>
      </div>
    );
  }

  const isExpired =
    String(order.status || "").toLowerCase() === "expired" ||
    (Boolean(order.expiry_date) && new Date(order.expiry_date).getTime() < Date.now());

  const isPendingInspection = String(order.status || "").toLowerCase() === "pendinginspection";
  const isActive =
    !isExpired &&
    (String(order.status || "").toLowerCase() === "active" ||
      String(order.status || "").toLowerCase() === "success" ||
      !order.status);

  const customerAddress = [
    order.customer?.building,
    order.customer?.block,
    order.customer?.road,
    order.customer?.city,
    order.customer?.state,
    order.customer?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const inspectionImages = [
    { label: "Front View", url: order.vehicle?.image_front },
    { label: "Rear View", url: order.vehicle?.image_rear },
    { label: "Left Side", url: order.vehicle?.image_left },
    { label: "Right Side", url: order.vehicle?.image_right },
    { label: "Odometer", url: order.vehicle?.odometer_image },
  ].filter((item) => Boolean(item.url));

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Breadcrumb Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/dealer/package-history"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-primary transition-colors group cursor-pointer self-start"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all shadow-2xs">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Back to Package History</span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadOrderDetail}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Refresh order details"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? "animate-spin text-primary" : ""
                }`}
            />
            <span>Refresh</span>
          </button>

          {isPendingInspection && (
            <Button
              type="button"
              onClick={activeLink ? () => openInspectionLinkModal(activeLink) : handleCreateInspectionLink}
              disabled={isCreatingLink}
              variant="outline"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-2xs cursor-pointer"
            >
              {isCreatingLink ? (
                <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
              ) : (
                <Smartphone className="h-3.5 w-3.5 text-blue-600" />
              )}
              <span>{activeLink ? "View Customer Link" : "Create Link"}</span>
            </Button>
          )}

          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloading ? "Opening..." : "Download Certificate"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Page Hero Banner Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-5 sm:p-7 shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-mono text-xs sm:text-sm font-bold bg-white/10 text-white px-3 py-1 rounded-lg border border-white/15 shadow-2xs">
                #{order.order_number}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isExpired
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-700 text-slate-300 border border-slate-600"
                  }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isExpired
                      ? "bg-rose-400"
                      : isActive
                        ? "bg-emerald-400"
                        : "bg-slate-400"
                    }`}
                />
                <span>{isExpired ? "Expired" : (order.status || "Active")}</span>
              </span>

              {order.payment_status && (
                <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {order.payment_status}
                </span>
              )}

              {order.car_segment && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-white/10 text-slate-200 border border-white/10">
                  Segment: {order.car_segment}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {order.plan_name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Purchased on{" "}
                  {order.created_at ? formatDate(order.created_at) : "N/A"}
                </span>
              </span>
              {order.start_date && order.expiry_date && (
                <span className="text-slate-400">
                  • Valid: {new Date(order.start_date).toLocaleDateString()} to{" "}
                  {new Date(order.expiry_date).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>

          {/* Pricing Highlight Pill */}
          {order.amount !== undefined && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:px-5 sm:py-3.5 text-left md:text-right shadow-inner">
                <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
                  Package Price
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {formatCurrency(order.amount || 0)}
                </span>
                <span className="text-[10px] text-slate-300 block font-medium mt-0.5">
                  Net / Policy Price
                </span>
              </div>

              {(order.payout_amount !== undefined || order.payout_percentage !== undefined) && (
                <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-2xl p-4 sm:px-5 sm:py-3.5 text-left md:text-right shadow-inner">
                  <span className="text-[10px] uppercase font-bold text-emerald-200 block tracking-wider">
                    Dealer Payout {order.payout_percentage ? `(${order.payout_percentage}%)` : ""}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-300">
                    {formatCurrency(order.payout_amount || 0)}
                  </span>
                  <span className="text-[10px] text-emerald-200 block font-medium mt-0.5">
                    Commission Earned
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Coverage & Entitlements Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
            <Clock className="h-4 w-4" />
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Plan Validity
          </span>
          <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
            {order.plan_period_months || 12} Months
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Expires:{" "}
            {order.expiry_date
              ? new Date(order.expiry_date).toLocaleDateString()
              : "N/A"}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            RSA Towing Radius
          </span>
          <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
            Up to {order.distance_km_allowed || 50} km
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Coverage per incident
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Incidents Allowed
          </span>
          <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
            {order.incidents_used || 0} / {order.incidents_allowed || 4}
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {(order.incidents_allowed || 4) - (order.incidents_used || 0)} Incidents remaining
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
            <Building className="h-4 w-4" />
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Hotel & Cab Benefits
          </span>
          <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
            Hotel: {order.hotel_accommodation_allowed || 2} Nights
          </p>
          <p className="text-xs sm:text-sm font-black text-slate-900">
            Cab: {order.cab_service_allowed || 2} Trips
          </p>
        </div>
      </div>

      {/* 4. Customer Information & Vehicle Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Customer Details Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Customer Details</h2>
              <p className="text-xs text-slate-400">Contact & delivery information</p>
            </div>
          </div>

          <div className="space-y-3.5 text-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Full Name
              </span>
              <p className="font-bold text-slate-900 text-base mt-0.5">
                {order.customer?.customer_name || "N/A"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Primary Contact
                </span>
                {order.customer?.customer_number ? (
                  <a
                    href={`tel:${order.customer.customer_number}`}
                    className="font-mono text-primary hover:underline font-bold flex items-center gap-1.5 mt-1"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{order.customer.customer_number}</span>
                  </a>
                ) : (
                  <span className="text-slate-500">N/A</span>
                )}
              </div>

              {order.customer?.alternative_number && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Alternative Phone
                  </span>
                  <a
                    href={`tel:${order.customer.alternative_number}`}
                    className="font-mono text-slate-700 hover:text-primary font-semibold flex items-center gap-1.5 mt-1"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{order.customer.alternative_number}</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Email Address
              </span>
              {order.customer?.email_address ? (
                <a
                  href={`mailto:${order.customer.email_address}`}
                  className="text-primary hover:underline font-semibold flex items-center gap-1.5 mt-1 truncate"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{order.customer.email_address}</span>
                </a>
              ) : (
                <span className="text-slate-500">N/A</span>
              )}
            </div>

            {customerAddress && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Registered Address
                </span>
                <p className="text-slate-700 mt-1 leading-relaxed flex items-start gap-1.5 text-xs sm:text-sm">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{customerAddress}</span>
                </p>
              </div>
            )}

            {order.customer?.gst_number && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  GST Number
                </span>
                <span className="font-mono text-slate-800 font-bold mt-0.5 block">
                  {order.customer.gst_number}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Details Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Vehicle Details</h2>
                <p className="text-xs text-slate-400">Specifications & identification</p>
              </div>
            </div>

            {order.vehicle?.car_segment && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                {order.vehicle.car_segment}
              </span>
            )}
          </div>

          <div className="space-y-3.5 text-sm">
            {/* License Plate Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Registration Number
                </span>
                <span className="font-mono font-black text-slate-900 text-lg sm:text-xl tracking-wider">
                  {order.vehicle?.vehicle_reg_number || "N/A"}
                </span>
              </div>
              {order.vehicle?.registration_year && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Model Year
                  </span>
                  <span className="text-sm font-black text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg inline-block">
                    {order.vehicle.registration_year}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Make & Model
                </span>
                <span className="font-bold text-slate-900 block mt-0.5 truncate">
                  {order.vehicle?.vehicle_make || ""} {order.vehicle?.vehicle_model || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Fuel & Transmission
                </span>
                <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                  {order.vehicle?.vehicle_fuel_type || "Petrol"} •{" "}
                  {order.vehicle?.transmission_type || "Manual"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Odometer Reading
                </span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Gauge className="h-4 w-4 text-slate-400" />
                  <span>
                    {order.vehicle?.current_odometer_reading
                      ? `${Number(order.vehicle.current_odometer_reading).toLocaleString()} km`
                      : "N/A"}
                  </span>
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Chassis Number (VIN)
                </span>
                <span className="font-mono text-slate-800 text-xs font-bold block truncate mt-1">
                  {order.vehicle?.chassis_number || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Inspection Photos Gallery (if present) */}
      {inspectionImages.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Vehicle Inspection Photos</h2>
                <p className="text-xs text-slate-400">
                  Uploaded at registration • Click on any photo to inspect full size
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={order.vehicle?.uploaded_by_dealer !== false ? "primary" : "secondary"} className="text-[10px]">
                {order.vehicle?.uploaded_by_dealer !== false ? "Uploaded by Dealer" : "Uploaded by Customer"}
              </Badge>
              {isPendingInspection && (
                <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                  Pending Inspection
                </Badge>
              )}
              <span className="text-xs font-semibold text-slate-500">
                {inspectionImages.length} Photos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
            {inspectionImages.map((photo, idx) => (
              <a
                key={idx}
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 aspect-4/3 flex flex-col items-center justify-center hover:border-primary hover:shadow-md transition-all cursor-pointer"
                title={`Open ${photo.label}`}
              >
                <img
                  src={photo.url}
                  alt={photo.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-white" />
                </div>
                <span className="absolute bottom-1.5 left-1.5 right-1.5 text-center bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold py-0.5 rounded-lg">
                  {photo.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Empty State / Photo Upload Option when photos are pending */}
      {inspectionImages.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xs space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Upload Vehicle Photos</h3>
                <Badge variant="secondary" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200 font-semibold">
                  Pending Inspection
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Upload all 5 vehicle inspection photos now as Dealer to activate coverage and generate the official certificate.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                type="button"
                onClick={activeLink ? () => openInspectionLinkModal(activeLink) : handleCreateInspectionLink}
                disabled={isCreatingLink}
                size="sm"
                variant="outline"
                className="font-bold text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl cursor-pointer"
              >
                {isCreatingLink ? (
                  <RefreshCw className="h-3.5 w-3.5 text-blue-600 mr-1 animate-spin" />
                ) : (
                  <Smartphone className="h-3.5 w-3.5 text-blue-600 mr-1" />
                )}
                {activeLink ? "View Customer Link" : "Create Link"}
              </Button>
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
          </div>

          {/* Customer Self-Inspection Option Banner */}
          <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span>Want Customer to Capture Photos From Their Smartphone?</span>
              </h4>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Generate an encrypted self-inspection link. The link tracks expiration (48h) and automatically marks photos as <strong>Uploaded by Customer</strong> once submitted.
              </p>
              {activeLink && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {activeLink.is_submitted ? "✓ Photos Submitted" : "Active Encrypted Link Ready"}
                  </span>
                  {activeLink.expires_at && !activeLink.is_submitted && (
                    <span className="text-[10px] text-blue-600 font-medium">
                      Valid until {new Date(activeLink.expires_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {activeLink && (
                <Button
                  type="button"
                  onClick={() => openInspectionLinkModal(activeLink)}
                  variant="outline"
                  className="font-bold text-xs px-3.5 py-2 border-blue-300 bg-white hover:bg-blue-50 text-blue-700 rounded-xl shadow-2xs cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" /> View / Share
                </Button>
              )}
              <Button
                type="button"
                onClick={handleCreateInspectionLink}
                disabled={isCreatingLink}
                className="font-bold text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm cursor-pointer"
              >
                {isCreatingLink ? (
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                )}
                {activeLink ? "Create New Link" : "Create Link"}
              </Button>
            </div>
          </div>

          {/* Error Banner */}
          {Object.keys(uploadErrors).length > 0 && (
            <div className="flex items-center justify-between text-xs text-red-600 font-medium bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
              <span>Please provide all 5 inspection photos to activate the package.</span>
              <button
                type="button"
                onClick={clearAllFiles}
                className="ml-3 text-red-700 underline font-bold hover:text-red-900 cursor-pointer shrink-0"
              >
                Clear Photos
              </button>
            </div>
          )}

          {/* 5 Photo Boxes (Same Design as Form!) */}
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
              const hasError = Boolean(uploadErrors[img.key]);

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
                      onChange={(e) => handleFileChange(e, img.key as keyof typeof files)}
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

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {Object.values(files).filter(Boolean).length === 5 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> All 5 photos selected. Ready to activate coverage.
                </span>
              ) : (
                <span>
                  {Object.values(files).filter(Boolean).length} of 5 photos added
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {Boolean(files.front || files.rear || files.left || files.right || files.odometer) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearAllFiles}
                  disabled={isUploadingInspection}
                  className="text-xs font-bold px-4 py-2 border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Clear All
                </Button>
              )}
              <Button
                type="button"
                onClick={handleUploadInspection}
                isLoading={isUploadingInspection}
                disabled={isUploadingInspection}
                className="w-full sm:w-auto font-bold text-xs px-6 py-2.5 bg-primary hover:bg-secondary text-white shadow-md shadow-primary/20 cursor-pointer"
              >
                Upload & Activate Package
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Footer Certificate Download Card */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              RSA Protection Certificate
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official PDF document containing membership details and emergency contact numbers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold px-5 py-2.5"
          >
            <Download className="h-4 w-4" />
            <span>
              {downloading ? "Opening Certificate..." : "Download Certificate (PDF)"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
