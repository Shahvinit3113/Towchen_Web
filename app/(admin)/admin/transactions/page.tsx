"use client";

import React, { useState, useEffect } from "react";
import { walletApi } from "@/lib/api/wallet";
import { WalletTransaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      const data = await walletApi.getTransactions();
      setTransactions(data);
    }
    loadData();
  }, []);

  const filtered = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.referenceId.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Platform-Wide Financial Audit Ledger
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Full double-entry audit trail across dealer wallets, gateway collections, and commission payouts.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by transaction reference or dealer..."
          className="pl-9 h-10 text-xs"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Ledger ID</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Dealer Account</th>
              <th className="py-3 px-4">Event Description</th>
              <th className="py-3 px-4">Reference ID</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {t.id}
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  {formatDate(t.createdAt)}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  Apex Motors (dlr-9941)
                </td>
                <td className="py-3.5 px-4 text-slate-800">{t.description}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                  {t.referenceId}
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
                <td className="py-3.5 px-4 text-right">
                  <Badge variant="success">{t.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
