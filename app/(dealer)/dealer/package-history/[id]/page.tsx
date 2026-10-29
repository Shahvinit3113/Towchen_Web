"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { packagesApi } from "@/lib/api/packages";
import { Button } from "@/components/ui/button";
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
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Building,
  Layers,
  Fuel,
  Settings,
} from "lucide-react";

export default function DealerPackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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
        alert("Certificate download URL is not available.");
      }
    } catch (err) {
      alert("Failed to download certificate. Please try again.");
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
              className={`h-3.5 w-3.5 text-slate-500 ${
                isLoading ? "animate-spin text-primary" : ""
              }`}
            />
            <span>Refresh</span>
          </button>

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
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isExpired
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : isActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-700 text-slate-300 border border-slate-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isExpired
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
            <span className="text-xs font-semibold text-slate-500">
              {inspectionImages.length} Photos
            </span>
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
