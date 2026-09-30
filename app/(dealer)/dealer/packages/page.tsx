"use client";

import React, { useState, useEffect } from "react";
import { packagesApi } from "@/lib/api/packages";
import { vehiclesApi } from "@/lib/api/vehicles";
import { RsaPackage, PackagePurchase, VehicleRecord } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt,
  CarFront,
} from "lucide-react";

export default function DealerPackagesPage() {
  const [packages, setPackages] = useState<RsaPackage[]>([]);
  const [purchases, setPurchases] = useState<PackagePurchase[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);

  // Checkout modal
  const [selectedPackage, setSelectedPackage] = useState<RsaPackage | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [pkgs, purs, vehs] = await Promise.all([
        packagesApi.getPackages(),
        packagesApi.getDealerPurchases(),
        vehiclesApi.getVehicles(),
      ]);
      setPackages(pkgs);
      setPurchases(purs);
      setVehicles(vehs);
    }
    loadData();
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !selectedVehicleId || !customerName || !customerPhone) {
      alert("Please fill all checkout fields.");
      return;
    }

    setIsProcessing(true);
    try {
      const purchase = await packagesApi.purchasePackage({
        packageId: selectedPackage.id,
        vehicleId: selectedVehicleId,
        customerName,
        customerPhone,
        paymentMethod: "wallet_deduct",
      });
      setPurchases([purchase, ...purchases]);
      setSelectedPackage(null);
      setCustomerName("");
      setCustomerPhone("");
      alert(`Package ${selectedPackage.title} successfully activated for ${customerName}!`);
    } catch (err: any) {
      alert(err.message || "Failed to process package purchase.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          RSA Packages & Customer Subscriptions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Issue roadside protection packages to car buyers and earn upfront commissions credited directly into your wallet.
        </p>
      </div>

      {/* Package Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-3xl border p-7 bg-white shadow-sm flex flex-col justify-between transition-all ${
              pkg.popular
                ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10 relative"
                : "border-slate-200"
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">{pkg.title}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  1-Year / 365 Days Comprehensive RSA Cover
                </p>
              </div>

              {/* Price & Dealer Commission Tag */}
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Customer MRP
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">
                      {formatCurrency(pkg.price)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatCurrency(pkg.mrp)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-700">
                    Dealer Commission
                  </span>
                  <p className="text-lg font-black text-emerald-600">
                    +{formatCurrency(pkg.dealerCommission)}
                  </p>
                </div>
              </div>

              {/* Features list */}
              <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                {pkg.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <Button
                onClick={() => setSelectedPackage(pkg)}
                size="lg"
                className={`w-full font-bold shadow-md ${
                  pkg.popular ? "bg-primary hover:bg-secondary" : ""
                }`}
              >
                <span>Sell & Activate Package</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Subscriptions Ledger */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Active Dealership Subscriptions
            </h2>
            <p className="text-xs text-slate-500">
              Subscribed vehicles eligible for 24/7 priority rescue.
            </p>
          </div>
          <Badge variant="primary">{purchases.length} Active Policies</Badge>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Policy Ref</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Vehicle Plate</th>
                <th className="py-3 px-4">Commission Earned</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map((pur) => (
                <tr key={pur.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {pur.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {pur.packageName}
                  </td>
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block">{pur.customerName}</strong>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {pur.customerPhone}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">
                    {pur.vehicleRegistration}
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-600">
                    +{formatCurrency(pur.commissionEarned)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {formatDate(pur.expiresAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge variant="success">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {purchases.map((pur) => (
            <div
              key={pur.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 text-xs shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900">{pur.id}</span>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="font-bold text-slate-900 text-sm">{pur.packageName}</p>
              <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-2">
                <span>Customer:</span>
                <strong className="text-slate-900">{pur.customerName} ({pur.customerPhone})</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Commission:</span>
                <strong className="text-emerald-600 font-bold">
                  +{formatCurrency(pur.commissionEarned)}
                </strong>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                <span>Expires:</span>
                <span>{formatDate(pur.expiresAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Package Checkout Modal */}
      <Modal
        isOpen={Boolean(selectedPackage)}
        onClose={() => setSelectedPackage(null)}
        title={`Activate ${selectedPackage?.title}`}
        description="Attach roadside membership to customer vehicle and earn commission."
        maxWidth="md"
      >
        {selectedPackage && (
          <form onSubmit={handleCheckout} className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Package Price:</span>
                <strong className="text-base font-black text-slate-900">
                  {formatCurrency(selectedPackage.price)}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 block font-semibold">Your Commission:</span>
                <strong className="text-base font-black text-emerald-600">
                  +{formatCurrency(selectedPackage.dealerCommission)}
                </strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Select Customer Vehicle
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-primary"
                required
              >
                <option value="">Select from inventory...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} - {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Customer Full Name"
              placeholder="e.g. Vikram Malhotra"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />

            <Input
              label="Customer Mobile Number"
              placeholder="e.g. 9812345678"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedPackage(null)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isProcessing} className="font-bold">
                Confirm & Activate Package
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
