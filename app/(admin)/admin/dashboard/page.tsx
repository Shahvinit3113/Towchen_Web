"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CarFront,
  Banknote,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [dealers, setDealers] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const [s, d] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllDealers(),
      ]);
      setStats(s);
      setDealers(d);
    }
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    await adminApi.approveDealer(id);
    setDealers(
      dealers.map((d) =>
        d.id === id ? { ...d, status: "active", isVerified: true } : d
      )
    );
  };

  const pendingApprovals = dealers.filter((d) => d.status === "pending_approval");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Fleet Operations & Financial Control
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Platform-wide metrics, partner dealer approvals, and nationwide dispatch SLAs.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-slate-200 space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Active Partner Dealerships
          </span>
          <p className="text-3xl font-black text-slate-900">
            {stats?.totalDealers || 142}
          </p>
          <span className="text-xs text-primary font-semibold block">
            Across 6 Metropolitan Hubs
          </span>
        </Card>

        <Card className="p-5 border border-slate-200 space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Total Protected Vehicles
          </span>
          <p className="text-3xl font-black text-slate-900">
            {stats?.activeProtectedVehicles || 3410}
          </p>
          <span className="text-xs text-emerald-600 font-semibold block">
            +18% month-over-month
          </span>
        </Card>

        <Card className="p-5 border border-slate-200 space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Monthly Gross Volume
          </span>
          <p className="text-3xl font-black text-emerald-600">
            {formatCurrency(stats?.monthlyGrossRevenue || 4890000)}
          </p>
          <span className="text-xs text-slate-500 block">
            RSA sales + On-demand dispatch
          </span>
        </Card>

        <Card className="p-5 border border-slate-200 space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Dispatch SLA Benchmark
          </span>
          <p className="text-3xl font-black text-primary">
            {stats?.avgResponseMinutes || 14.8}m
          </p>
          <span className="text-xs text-emerald-600 font-semibold block">
            99.2% within 20m target
          </span>
        </Card>
      </div>

      {/* Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pending Dealer Approvals */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Dealer Partner Approval Queue
              </h2>
              <p className="text-xs text-slate-500">
                Review GSTIN documents, bank details, and grant portal access.
              </p>
            </div>
            <Link
              href="/admin/dealers"
              className="text-xs font-bold text-red-600 hover:text-red-700"
            >
              All Dealers ({dealers.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <Card className="p-8 text-center text-slate-400 text-xs">
                No pending dealer approvals in queue. All partners verified!
              </Card>
            ) : (
              pendingApprovals.map((dlr) => (
                <div
                  key={dlr.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-slate-900">
                        {dlr.businessName}
                      </strong>
                      <Badge variant="warning">Verification Pending</Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      Contact: {dlr.contactPerson} • {dlr.phone}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500">
                      GSTIN: {dlr.gstinOrTaxId} • {dlr.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(dlr.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve & Verify</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations Links */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Platform Command Centers
          </h2>

          <div className="space-y-3">
            <Link
              href="/admin/payments"
              className="block p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Dealer Payout Approvals
                    </h3>
                    <p className="text-xs text-slate-500">
                      8 pending withdrawal requests ready for NEFT batching
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>

            <Link
              href="/admin/commissions"
              className="block p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Commission Tier Rules
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard (₹500), Gold (₹900), and Platinum (₹1600) margins
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>

            <Link
              href="/admin/transactions"
              className="block p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Financial Audit Ledger
                    </h3>
                    <p className="text-xs text-slate-500">
                      Reconcile razorpay payouts, customer charges, and taxes
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
