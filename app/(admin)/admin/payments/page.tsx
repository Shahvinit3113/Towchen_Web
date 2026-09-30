"use client";

import React, { useState, useEffect } from "react";
import { walletApi } from "@/lib/api/wallet";
import { adminApi } from "@/lib/api/admin";
import { PayoutRequest } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Landmark, Clock } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await walletApi.getPayoutRequests();
      setPayouts(data);
    }
    loadData();
  }, []);

  const handleResolve = async (id: string, status: "completed" | "rejected") => {
    await adminApi.resolvePayout(id, status);
    setPayouts(
      payouts.map((p) =>
        p.id === id ? { ...p, status, processedAt: new Date().toISOString() } : p
      )
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Dealer Withdrawal & Payout Approvals
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review dealer commission withdrawal requests, authorize NEFT/IMPS transfers, and settle accounts.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Payout ID</th>
              <th className="py-3 px-4">Dealership Entity</th>
              <th className="py-3 px-4">Requested On</th>
              <th className="py-3 px-4">Beneficiary Bank & Account</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Approval Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {p.id}
                </td>
                <td className="py-3.5 px-4">
                  <strong className="text-slate-900 block font-semibold">
                    {p.dealerName || "Apex Motors Autocare"}
                  </strong>
                  <span className="text-slate-400 font-mono text-[11px]">
                    ID: {p.dealerId}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  {formatDate(p.requestedAt)}
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-slate-800 font-medium block">
                    {p.bankAccount.bankName}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    A/C: {p.bankAccount.accountNumber} • IFSC: {p.bankAccount.ifscOrRouting}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                  {formatCurrency(p.amount)}
                </td>
                <td className="py-3.5 px-4">
                  <Badge
                    variant={p.status === "completed" ? "success" : "warning"}
                  >
                    {p.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {p.status === "processing" || p.status === "requested" ? (
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleResolve(p.id, "completed")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Approve NEFT
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleResolve(p.id, "rejected")}
                        className="text-xs font-bold"
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Settled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
