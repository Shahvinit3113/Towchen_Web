"use client";

import React, { useEffect, useState } from "react";
import { walletApi } from "@/lib/api/wallet";
import { WalletSummary, WalletTransaction, PayoutRequest } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  TrendingUp,
  History,
  Building,
  CheckCircle2,
  Clock,
  ArrowRightLeft
} from "lucide-react";

export default function WalletPage() {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscOrRouting: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sumData, txns, pts] = await Promise.all([
        walletApi.getSummary(),
        walletApi.getTransactions(),
        walletApi.getPayoutRequests()
      ]);
      setSummary(sumData);
      setTransactions(txns);
      setPayouts(pts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary) return;
    const reqAmount = Number(payoutForm.amount);
    
    if (reqAmount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }
    
    if (reqAmount > summary.currentBalance) {
      alert("Insufficient wallet balance");
      return;
    }

    setIsSubmitting(true);
    try {
      await walletApi.requestPayout({
        dealerId: summary.dealerId,
        dealerName: payoutForm.accountHolderName,
        amount: reqAmount,
        bankAccount: {
          accountHolderName: payoutForm.accountHolderName,
          accountNumber: payoutForm.accountNumber,
          ifscOrRouting: payoutForm.ifscOrRouting,
          bankName: payoutForm.bankName
        }
      });
      alert("Payout request submitted successfully!");
      setIsPayoutModalOpen(false);
      setPayoutForm({
        amount: "",
        bankName: "",
        accountHolderName: "",
        accountNumber: "",
        ifscOrRouting: "",
      });
      loadData(); // Refresh data
    } catch (err) {
      alert("Failed to submit payout request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-sm font-medium animate-pulse">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Wallet & Payouts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your package sales commissions and withdraw funds to your bank account.
          </p>
        </div>

        <Button 
          onClick={() => setIsPayoutModalOpen(true)}
          className="font-bold gap-2 bg-primary hover:bg-secondary"
        >
          <Building className="h-4 w-4" />
          <span>Request Payout</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Wallet Balance */}
        <Card className="border border-primary/20 bg-gradient-to-br from-white to-primary/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-primary tracking-wider">
              Available Balance
            </span>
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatCurrency(summary?.currentBalance || 0)}
            </span>
          </div>
        </Card>

        {/* Pending Payouts */}
        <Card className="border border-amber-200/50 bg-gradient-to-br from-white to-amber-50/50 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">
              Pending Payouts
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatCurrency(summary?.pendingPayouts || 0)}
            </span>
          </div>
        </Card>

        {/* Total Withdrawn */}
        <Card className="border border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Total Withdrawn
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatCurrency(summary?.totalWithdrawn || 0)}
            </span>
          </div>
        </Card>

        {/* Lifetime Earnings */}
        <Card className="border border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Lifetime Earned
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {formatCurrency(summary?.lifetimeEarnings || 0)}
            </span>
          </div>
        </Card>
      </div>

      <div className="hidden">
        {/* Transactions Ledger */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-slate-400" />
                Wallet Transactions
              </h2>
              <p className="text-xs text-slate-500">
                Recent commissions, bonuses, and debits.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">No transactions found.</p>
            ) : (
              transactions.map((txn) => (
                <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <strong className="text-sm font-semibold text-slate-900 block">
                      {txn.description}
                    </strong>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                      <span>{formatDate(txn.createdAt)}</span>
                      <span>Ref: {txn.referenceId}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-base block ${
                        txn.amount > 0 ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {txn.amount > 0 ? `+${formatCurrency(txn.amount)}` : formatCurrency(txn.amount)}
                    </span>
                    <Badge variant={txn.status === 'settled' ? 'success' : 'secondary'} className="text-[10px] mt-1 uppercase">
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payout History */}
        <div className="hidden space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5 text-slate-400" />
                Payout History
              </h2>
              <p className="text-xs text-slate-500">
                Record of funds withdrawn to your bank accounts.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100">
            {payouts.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">No payout requests found.</p>
            ) : (
              payouts.map((payout) => (
                <div key={payout.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-semibold text-slate-900">
                        {payout.bankAccount.bankName}
                      </strong>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                        A/C: *{payout.bankAccount.accountNumber.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                      <span>Req: {formatDate(payout.requestedAt)}</span>
                      {payout.processedAt && (
                        <span>Processed: {formatDate(payout.processedAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between">
                    <span className="font-black text-lg text-slate-900">
                      {formatCurrency(payout.amount)}
                    </span>
                    <Badge 
                      variant={payout.status === 'completed' ? 'success' : payout.status === 'processing' ? 'warning' : 'secondary'} 
                      className="text-[10px] mt-1 uppercase"
                    >
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        title="Request Payout"
        description={`Available Balance: ${formatCurrency(summary?.currentBalance || 0)}`}
      >
        <form onSubmit={handlePayoutRequest} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Withdrawal Amount (₹)
            </label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              required
              min="1"
              max={summary?.currentBalance || 0}
              value={payoutForm.amount}
              onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bank Name
            </label>
            <Input
              type="text"
              placeholder="e.g. HDFC Bank"
              required
              value={payoutForm.bankName}
              onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Account Holder Name
            </label>
            <Input
              type="text"
              placeholder="As per bank records"
              required
              value={payoutForm.accountHolderName}
              onChange={(e) => setPayoutForm({ ...payoutForm, accountHolderName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Account Number
            </label>
            <Input
              type="text"
              placeholder="Enter Account Number"
              required
              value={payoutForm.accountNumber}
              onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              IFSC Code
            </label>
            <Input
              type="text"
              placeholder="e.g. HDFC0001234"
              required
              value={payoutForm.ifscOrRouting}
              onChange={(e) => setPayoutForm({ ...payoutForm, ifscOrRouting: e.target.value })}
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPayoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !payoutForm.amount}
              className="bg-primary hover:bg-secondary font-bold"
            >
              {isSubmitting ? "Processing..." : "Confirm Request"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
