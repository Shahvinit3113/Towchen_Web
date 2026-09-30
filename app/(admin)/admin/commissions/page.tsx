"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Percent, TrendingUp, Award, Settings, CheckCircle2 } from "lucide-react";

export default function AdminCommissionsPage() {
  const [tiers, setTiers] = useState([
    {
      name: "Standard Partner",
      minSales: 0,
      essentialComm: 400,
      proShieldComm: 700,
      eliteComm: 1200,
      dealersEnrolled: 64,
    },
    {
      name: "Gold Partner",
      minSales: 25,
      essentialComm: 500,
      proShieldComm: 900,
      eliteComm: 1600,
      dealersEnrolled: 62,
    },
    {
      name: "Platinum Elite Partner",
      minSales: 75,
      essentialComm: 650,
      proShieldComm: 1200,
      eliteComm: 2100,
      dealersEnrolled: 16,
    },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Dealer Commission Framework & Margin Rules
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Automated commission calculations, partner tiers, and performance incentives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier, idx) => (
          <Card
            key={idx}
            className="p-6 border border-slate-200 bg-white rounded-3xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">{tier.name}</h2>
              <Badge variant="primary">{tier.dealersEnrolled} Dealers</Badge>
            </div>

            <p className="text-xs text-slate-500">
              Threshold: Minimum {tier.minSales} verified vehicle activations / quarter.
            </p>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600">Essential RSA:</span>
                <strong className="text-emerald-600 font-bold">
                  +{formatCurrency(tier.essentialComm)}
                </strong>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600">Pro Shield Plus:</span>
                <strong className="text-emerald-600 font-bold">
                  +{formatCurrency(tier.proShieldComm)}
                </strong>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600">Elite Fleet Cover:</span>
                <strong className="text-emerald-600 font-bold">
                  +{formatCurrency(tier.eliteComm)}
                </strong>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => alert(`Configuring ${tier.name} rates`)}
              className="w-full text-xs font-semibold"
            >
              Modify Tier Rates
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
