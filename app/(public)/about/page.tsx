import React from "react";
import Link from "next/link";
import { constructMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  ShieldCheck,
  Award,
  Users,
  Building2,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";

export const metadata = constructMetadata({
  title: "About TowChen | Modernizing Roadside Logistics",
  description:
    "Learn about TowChen's mission to eliminate roadside uncertainty through technology, certified operators, and transparent emergency dispatch.",
  canonicalUrlRelative: "/about",
});

export default function AboutPage() {
  return (
    <div className="py-8 sm:py-12 md:py-16 space-y-10 sm:space-y-16">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <Badge variant="primary">Our Mission</Badge>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Building India&apos;s Most Reliable Roadside Mobility Infrastructure
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed">
            Vehicle breakdowns shouldn&apos;t involve stressful roadside haggling,
            uncertain wait times, or damaged car suspensions. TowChen connects
            motorists, auto dealerships, and recovery operators through a unified
            high-tech platform.
          </p>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
              <Truck className="h-6 w-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Modern Fleet Standards</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We mandate hydraulic zero-ground contact flatbed rigs, high-grade soft
              wheel tie-downs, and EV-specific dollies to protect customer vehicles.
            </p>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">100% Upfront Pricing</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our algorithmic distance and vehicle category calculations remove the
              guesswork. Customers and fleet managers know the exact bill before
              dispatch.
            </p>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Empowering Dealers</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Automobile dealerships and workshops use TowChen Partner OS for live
              vehicle audits, RC verification, and instant wallet commission payouts.
            </p>
          </div>
        </div>
      </section>

      {/* Network Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl dark-gradient text-white p-6 sm:p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-400">120K+</p>
              <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 mt-1">
                Completed Tows
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white">14.8m</p>
              <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 mt-1">
                Average Arrival
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-400">40+</p>
              <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 mt-1">
                Cities Covered
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-400">₹50L</p>
              <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 mt-1">
                Transit Insurance
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
