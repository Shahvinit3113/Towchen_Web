import React from "react";
import Link from "next/link";
import { constructMetadata } from "@/config/seo";
import { METRO_LOCATIONS } from "@/lib/constants/locations";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Truck, ChevronRight, PhoneCall } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata = constructMetadata({
  title: "Service Coverage Areas & Metropolitan Towing Hubs",
  description:
    "Explore 24/7 emergency towing and roadside assistance coverage across Delhi NCR, Mumbai MMR, Bengaluru, Hyderabad, Pune, and Chennai.",
  canonicalUrlRelative: "/locations",
});

export default function LocationsPage() {
  return (
    <div className="py-12 md:py-16 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <Badge variant="primary">Pan-India Fleet Coverage</Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Metropolitan Service Hubs & Highway Corridors
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Our high-density network places certified hydraulic flatbeds and patrol
            motorcycles within 5 to 10 kilometers of every major arterial road and
            expressway.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {METRO_LOCATIONS.map((loc) => (
            <div
              key={loc.slug}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:border-primary/30 transition-all space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {loc.city}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{loc.state}</p>
                </div>
                <Badge variant="success" className="font-mono">
                  ~{loc.responseTimeMinutes}m Avg ETA
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Fleet Units</span>
                  <strong className="text-slate-900 font-extrabold">
                    {loc.fleetCount} Active Trucks
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Live Operators</span>
                  <strong className="text-emerald-700 font-extrabold">
                    {loc.activeDrivers} On-Shift
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Major Expressways Covered:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {loc.coverageAreas.map((area, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${siteConfig.emergencyPhoneRaw}`}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Call {loc.city} Dispatch</span>
                </a>

                <Link
                  href={`/locations/${loc.slug}`}
                  className="text-xs font-bold text-primary hover:text-secondary flex items-center gap-1"
                >
                  <span>Explore Hub</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
