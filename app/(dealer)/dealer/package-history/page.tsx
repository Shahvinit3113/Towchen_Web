"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { packagesApi } from "@/lib/api/packages";
import { Button } from "@/components/ui/button";
import {
  Search,
  Download,
  Car,
  User,
  Phone,
  X,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function DealerPackageHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    loadOrders();
  }, [search]);

  // Reset pagination on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

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

  const isOrderExpired = (order: any) => {
    const s = String(order.status || "").toLowerCase();
    if (s === "expired") return true;
    if (order.expiry_date && new Date(order.expiry_date).getTime() < Date.now()) return true;
    return false;
  };

  const isOrderActive = (order: any) => {
    if (isOrderExpired(order)) return false;
    const s = String(order.status || "").toLowerCase();
    return s === "active" || s === "success" || !s;
  };

  // Filter orders by active status tab
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return isOrderActive(order);
    if (statusFilter === "expired") return isOrderExpired(order);
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeCount = orders.filter(isOrderActive).length;
  const expiredCount = orders.filter(isOrderExpired).length;

  return (
    <div className="space-y-3 sm:space-y-5 max-w-full">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Package History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View and manage all RSA packages purchased by your dealership.
          </p>
        </div>

        {/* Quick Refresh Button */}
        <button
          onClick={loadOrders}
          disabled={isLoadingOrders}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs disabled:opacity-50 transition-colors cursor-pointer"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search order ref, customer, plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white shadow-2xs transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "active"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("expired")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "expired"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Expired ({expiredCount})
          </button>
        </div>
      </div>

      {/* 3. MOBILE VIEW: Compact App-Style Cards (Screen < 768px) */}
      <div className="block md:hidden space-y-2.5">
        {isLoadingOrders ? (
          // Mobile Skeleton Loading Cards
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 animate-pulse shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 rounded-md w-28" />
                <div className="h-4 bg-slate-200 rounded-full w-14" />
              </div>
              <div className="h-3.5 bg-slate-200 rounded-md w-36" />
              <div className="h-7 bg-slate-100 rounded-lg" />
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          // Mobile Empty State
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">No packages found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {search
                ? `No packages matched "${search}". Try searching by order reference or license plate.`
                : "Your dealership hasn't purchased any RSA packages yet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs font-bold text-primary hover:underline pt-1 inline-block cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          // Mobile Compact Feed
          paginatedOrders.map((order) => {
            const isExpired = isOrderExpired(order);
            const isActive = isOrderActive(order);
            const displayStatus = isExpired ? "Expired" : (order.status || "Active");

            return (
              <div
                key={order.id}
                onClick={() => router.push(`/dealer/package-history/${order.id}`)}
                className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs space-y-2 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer active:scale-[0.99]"
              >
                {/* Row 1: Order Ref + Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-bold text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                      #{order.order_number}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {order.plan_name}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isExpired
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isExpired
                          ? "bg-rose-500"
                          : isActive
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    />
                    <span>{displayStatus}</span>
                  </span>
                </div>

                {/* Row 2: Customer & Vehicle Registration */}
                <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                  <div className="min-w-0 flex items-center gap-1.5 text-slate-700">
                    <User className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="font-medium truncate text-xs">{order.customer?.customer_name || "N/A"}</span>
                    {order.customer?.customer_number && (
                      <a
                        href={`tel:${order.customer.customer_number}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary hover:text-primary/80 shrink-0 inline-flex items-center gap-0.5 font-mono text-[10px]"
                        title="Call Customer"
                      >
                        <Phone className="h-2.5 w-2.5 inline" />
                      </a>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-slate-800">
                    <Car className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                    <span>{order.vehicle?.vehicle_reg_number || "N/A"}</span>
                  </div>
                </div>

                {/* Row 3: Action Buttons (Download Certificate) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(order.id);
                    }}
                    disabled={downloadingId === order.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Download className="h-3 w-3" />
                    <span>
                      {downloadingId === order.id
                        ? "Opening..."
                        : "Download Certificate"}
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
                <th className="py-3 px-4 text-right">Actions</th>
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
                    <td className="py-3.5 px-4 text-right"><div className="h-8 bg-slate-200 rounded-md w-24 ml-auto" /></td>
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
                          className="text-xs font-bold text-primary hover:underline pt-1 inline-block cursor-pointer"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isExpired = isOrderExpired(order);
                  const isActive = isOrderActive(order);
                  const displayStatus = isExpired ? "Expired" : (order.status || "Active");

                  return (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/dealer/package-history/${order.id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
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
                            isExpired
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isExpired
                                ? "bg-rose-500"
                                : isActive
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          <span>{displayStatus}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(order.id);
                          }}
                          disabled={downloadingId === order.id}
                          className="hover:border-primary hover:text-primary transition-colors text-xs inline-flex items-center gap-1"
                          title="Download Certificate"
                        >
                          <Download className="h-3.5 w-3.5" />
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

      {/* 5. Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1 border-t border-slate-200/60">
          <p className="text-xs text-slate-500 order-2 sm:order-1">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * pageSize, filteredOrders.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {filteredOrders.length}
            </span>{" "}
            packages
          </p>

          <div className="flex items-center gap-1 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-primary text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

