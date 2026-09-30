"use client";

import React, { useState, useEffect } from "react";
import { walletApi } from "@/lib/api/wallet";
import { dealerApi } from "@/lib/api/dealer";
import { WalletSummary, PayoutRequest, DealerProfile } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Wallet,
  ArrowUpRight,
  Landmark,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { payoutRequestSchema, PayoutRequestFormData } from "@/lib/validations";

export default function DealerWalletPage() {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [w, p, d] = await Promise.all([
        walletApi.getSummary(),
        walletApi.getPayoutRequests(),
        dealerApi.getProfile(),
      ]);
      setWallet(w);
      setPayouts(p);
      setProfile(d);
    }
    loadData();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PayoutRequestFormData>({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      amount: 5000,
      accountHolderName: profile?.bankDetails.accountHolderName || "Apex Motors Autocare Pvt Ltd",
      accountNumber: profile?.bankDetails.accountNumber || "918020038891234",
      ifscCode: profile?.bankDetails.ifscOrRouting || "HDFC0001234",
      bankName: profile?.bankDetails.bankName || "HDFC Bank Ltd",
    },
  });

  const onSubmitPayout = async (data: PayoutRequestFormData) => {
    if (!wallet || data.amount > wallet.currentBalance) {
      alert("Insufficient wallet balance.");
      return;
    }

    const created = await walletApi.requestPayout({
      dealerId: wallet.dealerId,
      amount: data.amount,
      bankAccount: {
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        ifscOrRouting: data.ifscCode,
        bankName: data.bankName,
      },
    });

    setPayouts([created, ...payouts]);
    setWallet({
      ...wallet,
      currentBalance: wallet.currentBalance - data.amount,
      pendingPayouts: wallet.pendingPayouts + data.amount,
    });
    setIsPayoutModalOpen(false);
    reset();
    alert("Payout request submitted! Transfer will settle within 24 bank hours.");
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dealer Wallet & Payouts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time balance settlement, bank NEFT withdrawal requests, and historical receipts.
          </p>
        </div>

        <Button
          onClick={() => setIsPayoutModalOpen(true)}
          size="md"
          className="font-bold gap-2 shadow-md"
        >
          <Landmark className="h-4 w-4" />
          <span>Request Bank Payout</span>
        </Button>
      </div>

      {/* KPI Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-primary/20 bg-primary/5 p-5 space-y-2">
          <span className="text-xs uppercase font-bold text-primary tracking-wider">
            Available for Withdrawal
          </span>
          <p className="text-3xl font-black text-slate-900">
            {formatCurrency(wallet?.currentBalance || 24500)}
          </p>
          <span className="text-xs text-emerald-700 font-semibold block">
            Instant NEFT / IMPS Available
          </span>
        </Card>

        <Card className="border border-slate-200 p-5 space-y-2">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Pending Bank Payouts
          </span>
          <p className="text-3xl font-black text-amber-600">
            {formatCurrency(wallet?.pendingPayouts || 5000)}
          </p>
          <span className="text-xs text-slate-500 block">
            Under bank clearing cycle
          </span>
        </Card>

        <Card className="border border-slate-200 p-5 space-y-2">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Total Withdrawn to Date
          </span>
          <p className="text-3xl font-black text-slate-900">
            {formatCurrency(wallet?.totalWithdrawn || 88900)}
          </p>
          <span className="text-xs text-slate-500 block">
            Verified to HDFC Bank A/C
          </span>
        </Card>

        <Card className="border border-slate-200 p-5 space-y-2">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Lifetime Commission
          </span>
          <p className="text-3xl font-black text-emerald-600">
            {formatCurrency(wallet?.lifetimeEarnings || 118400)}
          </p>
          <span className="text-xs text-emerald-600 font-semibold block">
            Rank: Top 5% Dealers
          </span>
        </Card>
      </div>

      {/* Payout History Ledger */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900">
          Bank Payout Settlement Requests
        </h2>

        {/* Desktop Table */}
        <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Request Ref</th>
                <th className="py-3 px-4">Requested On</th>
                <th className="py-3 px-4">Beneficiary Bank</th>
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {p.id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {formatDate(p.requestedAt)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {p.bankAccount.bankName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    •••• {p.bankAccount.accountNumber.slice(-4)}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge
                      variant={p.status === "completed" ? "success" : "warning"}
                    >
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {payouts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 text-xs shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900">{p.id}</span>
                <Badge
                  variant={p.status === "completed" ? "success" : "warning"}
                >
                  {p.status}
                </Badge>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-slate-500">{p.bankAccount.bankName} (•••• {p.bankAccount.accountNumber.slice(-4)})</span>
                <strong className="text-base font-black text-slate-900">
                  {formatCurrency(p.amount)}
                </strong>
              </div>
              <p className="text-[11px] text-slate-400">
                Requested on {formatDate(p.requestedAt)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Request Modal */}
      <Modal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        title="Request Bank Payout"
        description="Transfer your earned commission directly to your verified business bank account."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmitPayout)} className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
            <span className="text-slate-500">Available Balance:</span>
            <strong className="text-base font-black text-slate-900">
              {formatCurrency(wallet?.currentBalance || 24500)}
            </strong>
          </div>

          <Input
            label="Withdrawal Amount (₹)"
            type="number"
            placeholder="5000"
            {...register("amount", { valueAsNumber: true })}
            error={errors.amount?.message}
          />

          <Input
            label="Account Holder Name"
            placeholder="Apex Motors Autocare Pvt Ltd"
            {...register("accountHolderName")}
            error={errors.accountHolderName?.message}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Account Number"
              placeholder="918020038891234"
              {...register("accountNumber")}
              error={errors.accountNumber?.message}
            />
            <Input
              label="IFSC Code"
              placeholder="HDFC0001234"
              {...register("ifscCode")}
              error={errors.ifscCode?.message}
            />
          </div>

          <Input
            label="Bank Name"
            placeholder="HDFC Bank Ltd"
            {...register("bankName")}
            error={errors.bankName?.message}
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPayoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="font-bold">
              Submit Withdrawal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
