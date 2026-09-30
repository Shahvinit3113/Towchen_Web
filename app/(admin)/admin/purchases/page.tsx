"use client";

import React, { useState, useEffect } from "react";
import { packagesApi } from "@/lib/api/packages";
import { PackagePurchase } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<PackagePurchase[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      const data = await packagesApi.getDealerPurchases();
      setPurchases(data);
    }
    loadData();
  }, []);

  const filtered = purchases.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.packageName.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.vehicleRegistration.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          All Dealer Package Purchases Ledger
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Master transaction log of all active and historical RSA packages issued nationwide.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by policy ID, customer, or plate..."
          className="pl-9 h-10 text-xs"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Policy Number</th>
              <th className="py-3 px-4">Dealership</th>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Vehicle Plate</th>
              <th className="py-3 px-4">Package</th>
              <th className="py-3 px-4">Paid Gross</th>
              <th className="py-3 px-4">Dealer Comm.</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {p.id}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  Apex Motors (DLR-9941)
                </td>
                <td className="py-3.5 px-4">
                  <strong className="text-slate-900 block">{p.customerName}</strong>
                  <span className="text-slate-500 text-[11px] font-mono">
                    {p.customerPhone}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-primary">
                  {p.vehicleRegistration}
                </td>
                <td className="py-3.5 px-4 text-slate-800 font-medium">
                  {p.packageName}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {formatCurrency(p.amountPaid)}
                </td>
                <td className="py-3.5 px-4 font-black text-emerald-600">
                  +{formatCurrency(p.commissionEarned)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Badge variant="success">{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
