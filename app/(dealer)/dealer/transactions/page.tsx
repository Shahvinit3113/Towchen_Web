"use client";

import React, { useState, useEffect } from "react";
import { walletApi } from "@/lib/api/wallet";
import { WalletTransaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpRight, ArrowDownLeft, ReceiptText } from "lucide-react";

export default function DealerTransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      const txns = await walletApi.getTransactions();
      setTransactions(txns);
    }
    loadData();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.referenceId.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      filterType === "all" ||
      (filterType === "credit" && t.amount > 0) ||
      (filterType === "debit" && t.amount < 0);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Wallet Transactions & Audit Ledger
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete ledger of commission credits, bonuses, and bank payout debits.
        </p>
      </div>

      <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description or reference..."
            className="pl-9 h-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Flow:
          </span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 font-medium focus:outline-none"
          >
            <option value="all">All Transactions</option>
            <option value="credit">Credits Only (+)</option>
            <option value="debit">Payout Debits Only (-)</option>
          </select>
        </div>
      </Card>

      {/* Desktop Table */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {t.id}
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  {formatDate(t.createdAt)}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-700">
                  {t.referenceId}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-800">
                  {t.description}
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant="success">{t.status}</Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span
                    className={`font-black text-sm ${
                      t.amount > 0 ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {t.amount > 0 ? `+${formatCurrency(t.amount)}` : formatCurrency(t.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 text-xs shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-900">{t.id}</span>
              <span
                className={`font-black text-sm ${
                  t.amount > 0 ? "text-emerald-600" : "text-slate-900"
                }`}
              >
                {t.amount > 0 ? `+${formatCurrency(t.amount)}` : formatCurrency(t.amount)}
              </span>
            </div>
            <p className="font-bold text-slate-800">{t.description}</p>
            <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-100">
              <span>{formatDate(t.createdAt)}</span>
              <span className="font-mono">{t.referenceId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
