"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { dealerApi } from "@/lib/api/dealer";
import { walletApi } from "@/lib/api/wallet";
import { packagesApi } from "@/lib/api/packages";
import { WalletSummary, WalletTransaction } from "@/types";
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
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [packageOrders, setPackageOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, txns, pkgs] = await Promise.all([
          dealerApi.getStats(),
          walletApi.getTransactions(),
          packagesApi.getDealerPackageOrders(),
        ]);
        setStats(statsData);
        setTransactions(txns);
        setPackageOrders(Array.isArray(pkgs) ? pkgs : (pkgs?.data || pkgs?.items || []));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-sm font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Dealership Earnings Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Real-time status of your roadside package sales and wallet credits.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link href="/dealer/packages">
            <Button size="sm" className="font-bold gap-1.5 shadow-sm text-xs sm:text-sm">
              <Plus className="h-4 w-4" />
              <span>Purchase Package</span>
            </Button>
          </Link>
          <Link href="/dealer/wallet">
            <Button variant="outline" size="sm" className="font-bold gap-1.5 text-xs sm:text-sm">
              <Wallet className="h-4 w-4 text-primary" />
              <span>Payouts</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Available Wallet Balance - Full width on mobile for prominence */}
        <Card className="col-span-2 lg:col-span-1 border border-primary/20 bg-gradient-to-br from-white to-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs uppercase font-bold text-primary tracking-wider">
              Available Wallet
            </span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/15 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatCurrency(stats?.availableBalance || 24500)}
            </span>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600 shrink-0" />
              <span className="text-emerald-600 font-semibold">+₹14,200</span>
              <span>this month</span>
            </p>
          </div>
        </Card>

        {/* Active Subscriptions */}
        <Card className="col-span-1 border border-slate-200/80 p-3.5 sm:p-5 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs uppercase font-bold text-slate-500 tracking-wider truncate">
              RSA Packages
            </span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              {stats?.activePackages || 39}
            </span>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
              92% renewal retention
            </p>
          </div>
        </Card>

        {/* Lifetime Commission */}
        <Card className="col-span-1 border border-slate-200/80 p-3.5 sm:p-5 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs uppercase font-bold text-slate-500 tracking-wider truncate">
              Lifetime Earned
            </span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-600 truncate block">
              {formatCurrency(stats?.lifetimeEarned || 118400)}
            </span>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
              ₹88,900 withdrawn
            </p>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Packages & Commission Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Main Content (Packages) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">

          {/* Recent Package Orders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Package Orders
                </h2>
                <p className="text-xs text-slate-500">
                  Track your latest roadside assistance package sales.
                </p>
              </div>
              <Link
                href="/dealer/package-history"
                className="text-xs font-bold text-primary hover:text-secondary"
              >
                View History →
              </Link>
            </div>

            <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packageOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 font-mono">{order.order_number}</strong>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{order.plan_name}</td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block">{order.customer?.customer_name}</strong>
                        <span className="text-slate-500 font-mono text-[11px]">{order.customer?.customer_number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success">{order.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2">
              {packageOrders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200/90 bg-white p-2.5 space-y-1 shadow-2xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80">
                      #{order.order_number}
                    </span>
                    <Badge variant="success" className="text-[10px] py-0 px-2">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="font-semibold text-slate-900 truncate">
                      {order.plan_name}
                    </span>
                    <span className="text-slate-500 truncate text-[11px]">
                      {order.customer?.customer_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Wallet Credits */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
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
