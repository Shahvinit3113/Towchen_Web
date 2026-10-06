"use client";

import React, { useState, useEffect } from "react";
import { packagesApi } from "@/lib/api/packages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";

export default function DealerPackageHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [search, setSearch] = useState("");

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
      console.error(err);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }

  const handleDownload = async (id: string) => {
    try {
      const url = await packagesApi.getCertificateDownloadUrl(id);
      if (url) {
        window.open(url, '_blank');
      } else {
        alert("Download URL not found");
      }
    } catch (err) {
      alert("Failed to download certificate.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Package History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          View and manage all RSA packages purchased by your dealership.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary w-64"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
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
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-100 last:border-0">
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded-md w-24"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded-md w-32"></div></td>
                    <td className="py-3.5 px-4 space-y-1.5">
                      <div className="h-4 bg-slate-200 rounded-md w-28"></div>
                      <div className="h-3 bg-slate-200 rounded-md w-20"></div>
                    </td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded-md w-24"></div></td>
                    <td className="py-3.5 px-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-8 bg-slate-200 rounded-md w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.order_number}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{order.plan_name}</td>
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block">{order.customer?.customer_name}</strong>
                      <span className="text-slate-500 text-[11px] font-mono">{order.customer?.customer_number}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {order.vehicle?.vehicle_reg_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success">{order.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(order.id)}>
                        <Download className="h-4 w-4 mr-1.5" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
