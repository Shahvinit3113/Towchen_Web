"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { dealerApi } from "@/lib/api/dealer";
import { vehiclesApi } from "@/lib/api/vehicles";
import { walletApi } from "@/lib/api/wallet";
import { VehicleRecord, WalletSummary, WalletTransaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CarFront,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  FileText,
  TrendingUp,
} from "lucide-react";

export default function DealerDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, vehs, txns] = await Promise.all([
          dealerApi.getStats(),
          vehiclesApi.getVehicles(),
          walletApi.getTransactions(),
        ]);
        setStats(statsData);
        setVehicles(vehs);
        setTransactions(txns);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dealership Fleet & Earnings Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status of your protected vehicles, roadside package sales, and wallet credits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dealer/vehicles">
            <Button size="sm" className="font-bold gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Register New Vehicle</span>
            </Button>
          </Link>
          <Link href="/dealer/wallet">
            <Button variant="outline" size="sm" className="font-bold gap-1.5">
              <Wallet className="h-4 w-4 text-primary" />
              <span>Payouts</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Wallet Balance */}
        <Card className="border border-primary/20 bg-gradient-to-br from-white to-primary/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-primary tracking-wider">
              Available Wallet
            </span>
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatCurrency(stats?.availableBalance || 24500)}
            </span>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">+₹14,200</span>
              <span>this month</span>
            </p>
          </div>
        </Card>

        {/* Protected Vehicles */}
        <Card className="border border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Protected Vehicles
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <CarFront className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.totalVehicles || 48}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {vehicles.filter((v) => v.status === "verified").length} Verified & Active
            </p>
          </div>
        </Card>

        {/* Active Subscriptions */}
        <Card className="border border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              RSA Packages Sold
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.activePackages || 39}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              92% renewal retention rate
            </p>
          </div>
        </Card>

        {/* Lifetime Commission */}
        <Card className="border border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Lifetime Earned
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {formatCurrency(stats?.lifetimeEarned || 118400)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              ₹88,900 withdrawn to HDFC A/C
            </p>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Recent Vehicles & Commission Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Vehicles Inventory */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Protected Vehicles
              </h2>
              <p className="text-xs text-slate-500">
                Manage live inspection photos, RC documents, and package tiers.
              </p>
            </div>
            <Link
              href="/dealer/vehicles"
              className="text-xs font-bold text-primary hover:text-secondary"
            >
              View All ({vehicles.length}) →
            </Link>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vehicle / Reg</th>
                  <th className="py-3 px-4">RSA Package</th>
                  <th className="py-3 px-4">Inspection</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.slice(0, 5).map((veh) => (
                  <tr key={veh.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block font-mono text-sm">
                        {veh.registrationNumber}
                      </strong>
                      <span className="text-slate-500">
                        {veh.make} {veh.model} ({veh.year})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">
                        {veh.packageName || "No Package"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {veh.inspectionPhotos ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Audit Complete</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                          <Camera className="h-3.5 w-3.5" />
                          <span>Needs Photos</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={veh.status === "verified" ? "success" : "warning"}
                      >
                        {veh.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dealer/vehicles`}
                        className="text-primary hover:text-secondary font-bold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="sm:hidden space-y-3">
            {vehicles.slice(0, 4).map((veh) => (
              <div
                key={veh.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-mono">
                      {veh.registrationNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {veh.make} {veh.model}
                    </p>
                  </div>
                  <Badge
                    variant={veh.status === "verified" ? "success" : "warning"}
                  >
                    {veh.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 flex justify-between border-t border-slate-100 pt-2">
                  <span>Package:</span>
                  <strong className="text-slate-900">
                    {veh.packageName || "None"}
                  </strong>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    {formatDate(veh.registeredAt)}
                  </span>
                  <Link
                    href={`/dealer/vehicles`}
                    className="text-xs font-bold text-primary"
                  >
                    Manage Vehicle →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Wallet Credits */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Commission Credits
              </h2>
              <p className="text-xs text-slate-500">
                Live ledger of sales commissions & payouts.
              </p>
            </div>
            <Link
              href="/dealer/wallet"
              className="text-xs font-bold text-primary hover:text-secondary"
            >
              Wallet →
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
            {transactions.slice(0, 4).map((txn) => (
              <div
                key={txn.id}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <strong className="text-slate-900 block font-semibold">
                    {txn.description}
                  </strong>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {formatDate(txn.createdAt)} • Ref: {txn.referenceId}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`font-black text-sm ${
                      txn.amount > 0 ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {txn.amount > 0 ? `+${formatCurrency(txn.amount)}` : formatCurrency(txn.amount)}
                  </span>
                  <Badge variant="success" className="text-[10px] block mt-0.5">
                    {txn.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
