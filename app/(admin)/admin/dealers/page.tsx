"use client";

import React, { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, ShieldCheck, Building2, User, Phone } from "lucide-react";

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      const data = await adminApi.getAllDealers();
      setDealers(data);
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

  const filtered = dealers.filter(
    (d) =>
      d.businessName.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase()) ||
      d.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Dealership Network Directory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, approve, and configure partner dealerships and tier commissions.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dealer by name or city..."
          className="pl-9 h-10 text-xs"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Dealership / Entity</th>
              <th className="py-3 px-4">Contact Person</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Inventory</th>
              <th className="py-3 px-4">Tier</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4">
                  <strong className="text-slate-900 block font-semibold text-sm">
                    {d.businessName}
                  </strong>
                  <span className="text-slate-400 font-mono text-[11px]">
                    ID: {d.id} • GST: {d.gstinOrTaxId}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-slate-800 font-medium block">
                    {d.contactPerson}
                  </span>
                  <span className="text-slate-500 text-[11px]">{d.phone}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-600">{d.city}</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-slate-900 block">
                    {d.activeVehicles} Vehicles
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {d.totalSold} Packages Sold
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant="primary" className="uppercase text-[10px]">
                    {d.commissionTier}
                  </Badge>
                </td>
                <td className="py-3.5 px-4">
                  <Badge
                    variant={d.status === "active" ? "success" : "warning"}
                  >
                    {d.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {d.status !== "active" ? (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(d.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Approve
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400">Verified</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {d.businessName}
                </h3>
                <p className="text-slate-500">{d.city}</p>
              </div>
              <Badge variant={d.status === "active" ? "success" : "warning"}>
                {d.status}
              </Badge>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <span>Contact:</span>
              <strong className="text-slate-800">{d.contactPerson} ({d.phone})</strong>
            </div>
            {d.status !== "active" && (
              <Button
                size="sm"
                onClick={() => handleApprove(d.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Approve Partner
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
