import React from "react";
import Link from "next/link";
import { constructMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { ALL_SERVICES } from "@/lib/constants/services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BatteryCharging,
  Disc,
  Fuel,
  Key,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Wrench,
} from "lucide-react";

export const metadata = constructMetadata({
  title: "24/7 Roadside Assistance & Quick Breakdown Rescue",
  description:
    "Fast 15-minute roadside assistance. Battery jumpstarts, flat tire changes, emergency fuel drops, and damage-free car lockout rescue.",
  canonicalUrlRelative: "/roadside-assistance",
});

const ROADSIDE_ICONS: Record<string, React.ReactNode> = {
  BatteryCharging: <BatteryCharging className="h-6 w-6" />,
  Disc: <Disc className="h-6 w-6" />,
  Fuel: <Fuel className="h-6 w-6" />,
  Key: <Key className="h-6 w-6" />,
};

export default function RoadsideAssistancePage() {
  const roadsideServices = ALL_SERVICES.filter((s) => s.category === "roadside");

  return (
    <div className="py-12 md:py-16 space-y-16">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <Badge variant="primary">On-The-Spot Breakdown Solutions</Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Rapid 24/7 Roadside Assistance (RSA)
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Dead battery? Puncture on the expressway? Keys locked inside? Our mobile
            assistance patrol vans are stocked with high-power booster packs,
            hydraulic jacks, and approved fuel canisters to fix your car on the spot.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href={`tel:${siteConfig.emergencyPhoneRaw}`}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 text-sm shadow-md"
            >
              <PhoneCall className="h-5 w-5 animate-bounce" />
              <span>Call Roadside Patrol: {siteConfig.emergencyPhone}</span>
            </a>
            <Link
              href="/#estimate-calculator"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3.5 text-sm"
            >
              Get Instant Estimate
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roadsideServices.map((srv) => (
            <div
              key={srv.id}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:border-primary/30 transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                  {ROADSIDE_ICONS[srv.iconName] || <Wrench className="h-6 w-6" />}
                </div>
                <Badge variant="success" className="font-mono">
                  Starting at ₹{srv.basePrice}
                </Badge>
              </div>

              <h2 className="text-2xl font-bold text-slate-900">{srv.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {srv.fullDesc}
              </p>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  What is included:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {srv.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-700 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dispatch SLA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-100/80 border border-slate-200 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-900">
              Need immediate patrol technician dispatched?
            </h3>
            <p className="text-sm text-slate-600">
              Our GPS fleet control room operates 24 hours a day, 365 days a year without downtime.
            </p>
          </div>
          <a
            href={`tel:${siteConfig.emergencyPhoneRaw}`}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 text-sm shadow-md"
          >
            <PhoneCall className="h-4 w-4 text-emerald-400" />
            <span>Connect to Roadside Dispatch</span>
          </a>
        </div>
      </section>
    </div>
  );
}
