import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { constructMetadata } from "@/config/seo";
import { METRO_LOCATIONS } from "@/lib/constants/locations";
import { ALL_SERVICES } from "@/lib/constants/services";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Truck,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Navigation,
} from "lucide-react";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return METRO_LOCATIONS.map((loc) => ({
    city: loc.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const hub = METRO_LOCATIONS.find((loc) => loc.slug === city);
  if (!hub) return constructMetadata({ title: "Location Not Found" });

  return constructMetadata({
    title: `24/7 Towing Service in ${hub.city} | ~${hub.responseTimeMinutes}m Fast Dispatch`,
    description: `Need an emergency tow truck in ${hub.city}? ${hub.fleetCount}+ flatbeds and roadside patrol vans covering ${hub.coverageAreas.slice(0, 3).join(", ")}.`,
    canonicalUrlRelative: `/locations/${hub.slug}`,
  });
}

export default async function CityLocationPage({ params }: Props) {
  const { city } = await params;
  const hub = METRO_LOCATIONS.find((loc) => loc.slug === city);

  if (!hub) {
    notFound();
  }

  return (
    <div className="py-12 md:py-16 space-y-16">
      {/* City Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{hub.activeDrivers} Tow Trucks Active in {hub.city}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              24/7 Emergency Towing & Roadside Assistance in{" "}
              <span className="text-primary">{hub.city}</span>
            </h1>

            <p className="text-slate-600 text-base leading-relaxed">
              Fastest dispatch response across {hub.state}. Whether you are stranded
              on the highway, trapped in a basement parking garage, or need a battery
              boost, our nearest flatbed reaches you in under {hub.responseTimeMinutes} minutes.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`tel:${siteConfig.emergencyPhoneRaw}`}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 text-sm shadow-md"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call {hub.city} Dispatch: {siteConfig.emergencyPhone}</span>
              </a>
              <Link href="/services">
                <Button variant="outline" size="lg">
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{hub.city} Dispatch Hub</h3>
                    <p className="text-xs text-slate-500">Live operational command center</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Units
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Average Response Time</span>
                  <span className="text-xs font-bold text-slate-900">{hub.responseTimeMinutes} Minutes</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Dedicated Fleet Size</span>
                  <span className="text-xs font-bold text-slate-900">{hub.fleetCount}+ Stationed Trucks</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Coverage Readiness</span>
                  <span className="text-xs font-bold text-emerald-600">24/7 Priority Emergency</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`tel:${siteConfig.emergencyPhoneRaw}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-secondary text-white font-bold py-3.5 text-sm shadow-md transition-colors"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call {hub.city} Fleet Dispatch Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Areas within this Metro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Key Expressways & Zones Covered in {hub.city}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Stationed units with rapid entry permissions and bypass clearances.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {hub.coverageAreas.map((area, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services available in this city */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Fleet Capabilities Available in {hub.city}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ALL_SERVICES.slice(0, 3).map((srv) => (
            <div
              key={srv.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3"
            >
              <h3 className="text-lg font-bold text-slate-900">{srv.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {srv.shortDesc}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">From ₹{srv.basePrice}</span>
                <span className="text-emerald-600 font-semibold">15m Dispatch</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
