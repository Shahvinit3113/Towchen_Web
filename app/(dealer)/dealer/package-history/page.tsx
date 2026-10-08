"use client";

import React, { useState, useEffect } from "react";
import { packagesApi } from "@/lib/api/packages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  Car,
  User,
  Phone,
  ShieldCheck,
  X,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function DealerPackageHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active">("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [search]);

  async function loadOrders() {
    setIsLoadingOrders(true);
    try {
      const data = await packagesApi.getDealerPackageOrders({ search });
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data && Array.isArray(data.data)) {
        setOrders(data.data);
      } else if (data && Array.isArray(data.items)) {
        setOrders(data.items);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load dealer package orders:", err);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      const url = await packagesApi.getCertificateDownloadUrl(id);
      if (url) {
        window.open(url, "_blank");
      } else {
        alert("Certificate download URL is not available.");
      }
    } catch (err) {
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter orders by active status tab
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    const s = String(order.status || "").toLowerCase();
    return s === "active" || s === "success";
  });

  const activeCount = orders.filter((o) => {
    const s = String(o.status || "").toLowerCase();
    return s === "active" || s === "success";
  }).length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Package History
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {orders.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View and manage all RSA packages purchased by your dealership.
          </p>
        </div>

        {/* Quick Refresh Button */}
        <button
          onClick={loadOrders}
          disabled={isLoadingOrders}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs disabled:opacity-50 transition-colors"
          title="Refresh orders list"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-slate-500 ${
              isLoadingOrders ? "animate-spin text-primary" : ""
            }`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Controls Bar: Search & Quick Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order ref, customer, plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white shadow-2xs transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "active"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Active ({activeCount})
          </button>
        </div>
      </div>

      {/* 3. MOBILE VIEW: Responsive Native-Style Cards (Screen < 768px) */}
      <div className="block md:hidden space-y-3">
        {isLoadingOrders ? (
          // Mobile Skeleton Loading Cards
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 animate-pulse shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 rounded-md w-28" />
                <div className="h-5 bg-slate-200 rounded-full w-16" />
              </div>
              <div className="h-4 bg-slate-200 rounded-md w-40" />
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div className="h-8 bg-slate-200 rounded-lg" />
                <div className="h-8 bg-slate-200 rounded-lg" />
              </div>
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          // Mobile Empty State
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">No packages found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {search
                ? `No packages matched "${search}". Try searching by order reference or license plate.`
                : "Your dealership hasn't purchased any RSA packages yet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs font-bold text-primary hover:underline pt-1 inline-block"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          // Mobile Cards Feed
          filteredOrders.map((order) => {
            const isActive =
              String(order.status || "").toLowerCase() === "active" ||
              String(order.status || "").toLowerCase() === "success";

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 hover:border-primary/30 transition-colors"
              >
                {/* Card Header: Order Reference + Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 truncate">
                      #{order.order_number}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    <span>{order.status || "Active"}</span>
                  </span>
                </div>

                {/* Plan Name Pill */}
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <strong className="text-sm font-bold text-slate-900 truncate">
                    {order.plan_name}
                  </strong>
                </div>

                {/* Card Content Grid: Customer & Vehicle Registration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  {/* Customer Info */}
                  <div className="bg-slate-50/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">
                        Customer
                      </span>
                      <strong className="text-slate-900 block truncate font-semibold">
                        {order.customer?.customer_name || "N/A"}
                      </strong>
                    </div>
                    {order.customer?.customer_number && (
                      <a
                        href={`tel:${order.customer.customer_number}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg shrink-0 font-bold"
                        title="Call Customer"
                      >
                        <Phone className="h-3 w-3" />
                        <span>{order.customer.customer_number}</span>
                      </a>
                    )}
                  </div>

                  {/* Vehicle License Plate */}
                  <div className="bg-slate-50/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">
                        Vehicle Plate
                      </span>
                      <div className="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-0.5 rounded-md font-mono font-black text-xs text-slate-900 tracking-wider shadow-2xs mt-0.5">
                        <Car className="h-3 w-3 text-slate-500 shrink-0" />
                        <span>{order.vehicle?.vehicle_reg_number || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action: Full-Width Mobile PDF Download CTA */}
                <div className="pt-1">
                  <button
                    onClick={() => handleDownload(order.id)}
                    disabled={downloadingId === order.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 active:bg-primary/15 text-primary font-bold text-xs shadow-2xs active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>
                      {downloadingId === order.id
                        ? "Opening Certificate..."
                        : "Download Certificate (PDF)"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. DESKTOP VIEW: Spacious Data Table (Screen >= 768px) */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle Plate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingOrders ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-100 last:border-0">
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded-md w-24" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded-md w-32" /></td>
                    <td className="py-3.5 px-4 space-y-1.5">
                      <div className="h-4 bg-slate-200 rounded-md w-28" />
                      <div className="h-3 bg-slate-200 rounded-md w-20" />
                    </td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded-md w-24" /></td>
                    <td className="py-3.5 px-4"><div className="h-6 bg-slate-200 rounded-full w-20" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-8 bg-slate-200 rounded-md w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                      <p className="font-semibold text-slate-700">No packages found</p>
                      <p className="text-xs text-slate-400">
                        {search ? `No packages matched "${search}".` : "No packages have been purchased yet."}
                      </p>
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="text-xs font-bold text-primary hover:underline pt-1 inline-block"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isActive =
                    String(order.status || "").toLowerCase() === "active" ||
                    String(order.status || "").toLowerCase() === "success";

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {order.plan_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 block font-semibold">
                          {order.customer?.customer_name || "N/A"}
                        </strong>
                        <span className="text-slate-500 text-[11px] font-mono">
                          {order.customer?.customer_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs">
                          <Car className="h-3 w-3 text-slate-500" />
                          <span>{order.vehicle?.vehicle_reg_number || "N/A"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{order.status || "Active"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(order.id)}
                          disabled={downloadingId === order.id}
                          className="hover:border-primary hover:text-primary transition-colors text-xs"
                        >
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          <span>{downloadingId === order.id ? "Opening..." : "PDF"}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
