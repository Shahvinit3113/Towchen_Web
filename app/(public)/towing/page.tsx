import React from "react";
import Link from "next/link";
import { constructMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { ALL_SERVICES } from "@/lib/constants/services";
import { EstimateWidget } from "@/components/estimate/estimate-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";

export const metadata = constructMetadata({
  title: "Flatbed & Heavy Towing Services | 24/7 Rapid Recovery",
  description:
    "Hydraulic flatbed towing, zero-ground contact AWD recovery, EV rescue, and expressway accident containment. Insured up to ₹50 Lakhs.",
  canonicalUrlRelative: "/towing",
});

export default function TowingPage() {
  const towingServices = ALL_SERVICES.filter((s) => s.category === "towing");

  return (
    <div className="py-12 md:py-16 space-y-16">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <Badge variant="primary">24/7 Heavy & Flatbed Fleet</Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Commercial & Passenger Vehicle Towing Services
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            From low-clearance basement extraction to high-speed expressway
            rollovers, TowChen deploys hydraulic tilt flatbeds, wheel-lift booms,
            and heavy winches certified for all major automobile brands.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href={`tel:${siteConfig.emergencyPhoneRaw}`}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 text-sm shadow-md"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Call Towing Hotline: {siteConfig.emergencyPhone}</span>
            </a>
            <a
              href="#towing-calculator"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3 text-sm"
            >
              Calculate Towing Price
            </a>
          </div>
        </div>
      </section>

      {/* Towing Services Deep-Dive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {towingServices.map((srv) => (
            <div
              key={srv.id}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:border-primary/30 transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                  <Truck className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="font-mono">
                  Base fare ₹{srv.basePrice}
                </Badge>
              </div>

              <h2 className="text-2xl font-bold text-slate-900">{srv.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {srv.fullDesc}
              </p>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Key Specifications:
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

      {/* Safety & Protocol Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl dark-gradient text-white p-8 md:p-12 space-y-6">
          <div className="max-w-2xl space-y-2">
            <Badge variant="primary" className="bg-primary/50/20 text-blue-300 border-blue-400/30">
              Zero-Damage Promise
            </Badge>
            <h2 className="text-3xl font-black tracking-tight">
              Strict OEM-Compliant Towing Safety Standards
            </h2>
            <p className="text-slate-300 text-sm">
              We never tow all-wheel-drive or electric vehicles with drive wheels
              dragging. Our certified equipment prevents mechanical stress on
              differentials, gearboxes, and suspension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-1">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
              <h3 className="font-bold text-base">₹50 Lakhs Transit Cover</h3>
              <p className="text-xs text-slate-400">
                Full comprehensive marine/cargo transit insurance coverage on every dispatched trip.
              </p>
            </div>
            <div className="space-y-1">
              <Zap className="h-6 w-6 text-blue-400" />
              <h3 className="font-bold text-base">Electric Vehicle Qualified</h3>
              <p className="text-xs text-slate-400">
                Trained on high-voltage cutoff switches and regenerative motor free-wheeling protocols.
              </p>
            </div>
            <div className="space-y-1">
              <Clock className="h-6 w-6 text-blue-400" />
              <h3 className="font-bold text-base">Real-time GPS Tracking</h3>
              <p className="text-xs text-slate-400">
                Watch the tow truck approach your location on a live interactive map link.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Calculator Widget Section */}
      <section id="towing-calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Calculate Upfront Towing Fare
          </h2>
          <p className="text-slate-600 text-sm">
            Enter your pickup spot and destination to get an instant distance and price breakdown.
          </p>
        </div>
        <EstimateWidget />
      </section>
    </div>
  );
}
