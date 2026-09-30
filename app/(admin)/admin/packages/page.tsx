"use client";

import React, { useState, useEffect } from "react";
import { packagesApi } from "@/lib/api/packages";
import { RsaPackage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShieldCheck, CheckCircle2, Plus } from "lucide-react";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<RsaPackage[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await packagesApi.getPackages();
      setPackages(data);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Package Configurations & Tier Margins
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure roadside assistance offerings, customer pricing, and dealer margin commissions.
          </p>
        </div>

        <Button
          onClick={() => alert("Package creation wizard configured in platform backend.")}
          className="font-bold gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Package Tier</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className="p-6 border border-slate-200 bg-white rounded-3xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono font-bold text-slate-400">
                {pkg.id}
              </span>
              <Badge variant="primary" className="uppercase text-[10px]">
                {pkg.tier}
              </Badge>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">{pkg.title}</h2>
              <p className="text-xs text-slate-500">Validity: {pkg.validityDays} Days</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer Price</span>
                <strong className="text-base font-black text-slate-900">
                  {formatCurrency(pkg.price)}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-medium">Dealer Payout</span>
                <strong className="text-base font-black text-emerald-600">
                  +{formatCurrency(pkg.dealerCommission)}
                </strong>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <p className="font-bold text-slate-700 uppercase text-[10px]">
                Included Entitlements:
              </p>
              {pkg.features.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
