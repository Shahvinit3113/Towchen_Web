"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Truck,
  BatteryCharging,
  Disc,
  Fuel,
  Key,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Layers,
  PhoneCall,
  Loader2,
  ShieldAlert,
  Car,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { towingApi } from "@/lib/api/towing";
import { siteConfig } from "@/config/site";

export interface CatalogServiceItem {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: string;
  service_id: number;
  sub_service_id?: number;
  description: string;
  base_price: number;
  base_distance?: number;
  iconName: string;
  features: string[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  BatteryCharging,
  Disc,
  Fuel,
  Key,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  Car,
};

function getIconForService(name: string, category: string): React.ComponentType<{ className?: string }> {
  const lower = `${name} ${category}`.toLowerCase();
  if (lower.includes("jump") || lower.includes("battery")) return BatteryCharging;
  if (lower.includes("flatbed") || lower.includes("tow") || lower.includes("underlift")) return Truck;
  if (lower.includes("mechanic") || lower.includes("tech") || lower.includes("repair")) return Wrench;
  if (lower.includes("tire") || lower.includes("wheel") || lower.includes("puncture")) return Disc;
  if (lower.includes("fuel") || lower.includes("petrol") || lower.includes("diesel")) return Fuel;
  if (lower.includes("lock") || lower.includes("custod") || lower.includes("key")) return Key;
  if (lower.includes("hydra") || lower.includes("crane") || lower.includes("ton") || lower.includes("recovery")) return ShieldCheck;
  return Truck;
}

function getFeaturesForService(name: string, category: string, baseDistance?: number): string[] {
  const dist = baseDistance ? `${baseDistance} km` : "5 km";
  const lower = `${name} ${category}`.toLowerCase();

  if (lower.includes("flatbed")) {
    return [
      "Zero ground-contact hydraulic tilt deck",
      `First ${dist} transport included`,
      "Ideal for AWD, 4x4, & low-clearance luxury cars",
      "Soft nylon wheel webbings & safety rigging",
      "Live GPS tracking with real-time arrival ETA",
    ];
  }

  if (lower.includes("underlift") || lower.includes("wheel-lift")) {
    return [
      "Low-clearance basement & tight parking capable",
      `First ${dist} transit included`,
      "Equipped with dollies for all-wheel recovery",
      "Rapid 5-minute hookup by certified technician",
      "Bumper & chassis zero-scratch guarantee",
    ];
  }

  if (lower.includes("zero degree")) {
    return [
      "Ultra-low approach angle for exotics & supercars",
      `First ${dist} enclosed/secure transit included`,
      "Hydraulic parallel slide deck with soft winching",
      "Full transit insurance coverage up to ₹50 Lakhs",
      "Senior specialized handling driver dispatched",
    ];
  }

  if (lower.includes("2-wheeler")) {
    return [
      "Specialized motorcycle wheel chocks & cradle bed",
      `First ${dist} motorcycle transport included`,
      "Quad-point soft strap tie-downs for handlebars",
      "Enclosed protection against road debris",
      "Priority express roadside arrival",
    ];
  }

  if (lower.includes("jump") || lower.includes("battery")) {
    return [
      "Commercial 12V / 24V jump booster equipment",
      "Full battery health & alternator diagnostic test",
      `Service radius up to ${dist} included`,
      "Rapid ~20-minute roadside dispatch",
      "All vehicle makes, hybrids, & start-stop models",
    ];
  }

  if (lower.includes("mechanic") || lower.includes("tech")) {
    return [
      "Certified mobile automotive technician on-site",
      "Instant OBD-II error scan & minor repair triage",
      "Coolant, belt, fuse, & hose emergency checks",
      `Service radius up to ${dist} included`,
      "Transparent upfront pricing before repair work",
    ];
  }

  if (lower.includes("custod")) {
    return [
      "24/7 CCTV-monitored secure vehicle holding compound",
      "Insured custody storage & gated vehicle protection",
      "Comprehensive check-in condition photograph report",
      "Safe custody handling for insurance & accident holds",
      "Authorized release protocol with verification",
    ];
  }

  if (lower.includes("hydra") || lower.includes("crane") || lower.includes("ton")) {
    return [
      "Heavy hydraulic boom & dual winch gear",
      "Rollover uprighting & steep ditch extraction",
      "Commercial highway collision scene containment",
      "Police & insurance documentation coordination",
      "Certified heavy vehicle recovery operators",
    ];
  }

  return [
    `First ${dist} coverage included in base rate`,
    "Rapid emergency priority dispatch 24/7",
    "Background-checked & certified operators",
    "Live GPS location tracking for customer",
    "Transparent pricing with no hidden charges",
  ];
}

const DEFAULT_CATALOG_ITEMS: CatalogServiceItem[] = [
  {
    id: "flatbed",
    slug: "flatbed-towing",
    name: "Flatbed Towing",
    title: "Flatbed Hydraulic Towing",
    category: "Towing",
    service_id: 1,
    sub_service_id: 1,
    description:
      "Premier zero-ground contact hydraulic platform transport for luxury sedans, electric vehicles, AWDs, and accident-damaged cars.",
    base_price: 1499,
    base_distance: 5,
    iconName: "Truck",
    features: getFeaturesForService("Flatbed", "Towing", 5),
  },
  {
    id: "underlift",
    slug: "wheel-lift-towing",
    name: "Underlift Quick Clearance",
    title: "Wheel-Lift Quick Clearance",
    category: "Towing",
    service_id: 1,
    sub_service_id: 3,
    description:
      "Agile pneumatic wheel-lift extraction specifically designed for tight underground basements, low ceilings, and congested urban streets.",
    base_price: 1099,
    base_distance: 5,
    iconName: "Truck",
    features: getFeaturesForService("Underlift", "Towing", 5),
  },
  {
    id: "zero_degree",
    slug: "zero-degree-towing",
    name: "Zero Degree Flatbed",
    title: "Zero Degree Low-Clearance Flatbed",
    category: "Towing",
    service_id: 1,
    sub_service_id: 4,
    description:
      "Ultra-low approach angle platform engineered specifically for exotic supercars, custom sports cars, and slammed lowered vehicles.",
    base_price: 1899,
    base_distance: 5,
    iconName: "Truck",
    features: getFeaturesForService("Zero Degree", "Towing", 5),
  },
  {
    id: "2_wheeler_flatbed",
    slug: "2-wheeler-towing",
    name: "2-Wheeler Flatbed",
    title: "Motorcycle & Scooter Transport",
    category: "Towing",
    service_id: 1,
    sub_service_id: 5,
    description:
      "Customized motorcycle transport bed with heavy-duty wheel chocks and quad soft-tie down straps ensuring zero tip-overs.",
    base_price: 699,
    base_distance: 5,
    iconName: "Truck",
    features: getFeaturesForService("2-Wheeler Flatbed", "Towing", 5),
  },
  {
    id: "jump_start",
    slug: "jump-start",
    name: "Jump Start Assistance",
    title: "Emergency Battery Jumpstart & Diagnostic",
    category: "Technician",
    service_id: 2,
    sub_service_id: 2,
    description:
      "Rapid roadside battery booster dispatch with digital voltage health analysis for all cars, hybrids, and commercial vehicles.",
    base_price: 499,
    base_distance: 5,
    iconName: "BatteryCharging",
    features: getFeaturesForService("Jump Start", "Technician", 5),
  },
  {
    id: "mechanic",
    slug: "mobile-mechanic",
    name: "Mobile Roadside Mechanic",
    title: "On-Site Mechanical Diagnostics & Triage",
    category: "Technician",
    service_id: 2,
    sub_service_id: 6,
    description:
      "Certified mechanic dispatched directly to your vehicle with scan tools to troubleshoot engine cutoffs, overheating, and sensor alerts.",
    base_price: 799,
    base_distance: 5,
    iconName: "Wrench",
    features: getFeaturesForService("Mechanic", "Technician", 5),
  },
  {
    id: "12_ton",
    slug: "accident-recovery",
    name: "12 Ton Crane & Winch Recovery",
    title: "12 Ton Hydra Accident Recovery",
    category: "Hydra",
    service_id: 4,
    sub_service_id: 8,
    description:
      "Medium heavy-duty hydraulic boom crane for rollover uprighting, deep ditch retrieval, and heavy collision scene extractions.",
    base_price: 2499,
    base_distance: 5,
    iconName: "ShieldCheck",
    features: getFeaturesForService("12 Ton", "Hydra", 5),
  },
  {
    id: "20_ton",
    slug: "heavy-recovery-20-ton",
    name: "20 Ton Heavy Winch Recovery",
    title: "20 Ton Commercial Heavy Recovery",
    category: "Hydra",
    service_id: 4,
    sub_service_id: 9,
    description:
      "Twin-line heavy industrial recovery rig capable of pulling overturned trucks, buses, and loaded freight vehicles.",
    base_price: 3499,
    base_distance: 5,
    iconName: "ShieldCheck",
    features: getFeaturesForService("20 Ton", "Hydra", 5),
  },
  {
    id: "custodian",
    slug: "vehicle-custody",
    name: "Secure Vehicle Custody",
    title: "Secure Compound Vehicle Custody",
    category: "Custody",
    service_id: 3,
    sub_service_id: 7,
    description:
      "Safe, CCTV-monitored vehicle holding facility for accident vehicles awaiting surveyor assessment or delayed repair.",
    base_price: 1500,
    base_distance: 5,
    iconName: "Key",
    features: getFeaturesForService("Custodian", "Custody", 5),
  },
];

export function ServicesCatalog() {
  const [services, setServices] = useState<CatalogServiceItem[]>(DEFAULT_CATALOG_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDynamic, setIsDynamic] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    towingApi
      .getServices()
      .then((data) => {
        if (!isMounted) return;

        if (data && data.services && Array.isArray(data.services) && data.services.length > 0) {
          const items: CatalogServiceItem[] = [];

          data.services.forEach((s: any) => {
            const catName = s.name || "Towing";
            if (s.sub_services && Array.isArray(s.sub_services) && s.sub_services.length > 0) {
              s.sub_services.forEach((sub: any) => {
                if (sub.is_active !== false) {
                  const slug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  const id = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
                  items.push({
                    id,
                    slug,
                    name: sub.name,
                    title: `${sub.name} ${catName === "Towing" && !sub.name.toLowerCase().includes("tow") ? "Towing" : ""}`.trim(),
                    category: catName,
                    service_id: s.id,
                    sub_service_id: sub.id,
                    description:
                      sub.description ||
                      s.description ||
                      `Professional ${sub.name} roadside assistance dispatched across the city 24/7.`,
                    base_price: sub.base_price ? Number(sub.base_price) : 999,
                    base_distance: sub.base_distance ? Number(sub.base_distance) : 5,
                    iconName: sub.icon || "Truck",
                    features: getFeaturesForService(sub.name, catName, sub.base_distance),
                  });
                }
              });
            } else {
              const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
              items.push({
                id: slug,
                slug,
                name: s.name,
                title: `${s.name} Roadside Service`,
                category: catName,
                service_id: s.id,
                description: s.description || "24/7 emergency vehicle assistance and towing service.",
                base_price: 999,
                base_distance: 5,
                iconName: "Truck",
                features: getFeaturesForService(s.name, catName, 5),
              });
            }
          });

          if (items.length > 0) {
            setServices(items);
            setIsDynamic(true);
          }
        }
      })
      .catch((err) => {
        console.warn("Using fallback services catalog:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => set.add(s.category));
    return ["All", ...Array.from(set)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat =
        selectedCategory === "All" ||
        s.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g. Flatbed, Jump Start, Hydra, Crane)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Real-time sync badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-end md:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              {isDynamic ? "Live Fleet API Rates Active" : "Dynamic Services Directory"}
            </span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const count =
              cat === "All"
                ? services.length
                : services.filter((s) => s.category.toLowerCase() === cat.toLowerCase()).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>{cat === "All" ? "All Services" : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100" />
                <div className="w-20 h-6 rounded-full bg-slate-100" />
              </div>
              <div className="h-6 w-3/4 rounded bg-slate-100" />
              <div className="h-14 w-full rounded bg-slate-100" />
              <div className="h-20 w-full rounded bg-slate-100" />
              <div className="h-10 w-full rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <Layers className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No matching services found</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Try adjusting your search query or choosing a different category filter.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => {
            const Icon = getIconForService(srv.name, srv.category);
            const isTowing = srv.category.toLowerCase().includes("tow");
            const isHydra = srv.category.toLowerCase().includes("hydra");
            const isTech = srv.category.toLowerCase().includes("tech");

            const badgeBg = isTowing
              ? "bg-blue-50 text-blue-700 border-blue-200/80"
              : isHydra
              ? "bg-purple-50 text-purple-700 border-purple-200/80"
              : isTech
              ? "bg-amber-50 text-amber-700 border-amber-200/80"
              : "bg-emerald-50 text-emerald-700 border-emerald-200/80";

            const iconBg = isTowing
              ? "bg-blue-50 text-blue-600"
              : isHydra
              ? "bg-purple-50 text-purple-600"
              : isTech
              ? "bg-amber-50 text-amber-600"
              : "bg-emerald-50 text-emerald-600";

            return (
              <div
                key={srv.id}
                id={srv.slug}
                className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  {/* Card Header: Icon & Category Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border ${badgeBg}`}
                    >
                      {srv.category} Fleet
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                      {srv.description}
                    </p>
                  </div>

                  {/* Included Specifications & Benefits */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Standard Inclusions:
                    </p>
                    <div className="space-y-1.5">
                      {srv.features.slice(0, 4).map((f, i) => (
                        <div
                          key={i}
                          className="text-xs text-slate-700 flex items-start gap-2"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-tight">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Live Fare & Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Base Fare
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900">
                        ₹{srv.base_price}
                      </span>
                      {srv.base_distance && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          ({srv.base_distance} km)
                        </span>
                      )}
                    </div>
                  </div>

                  <Link href={`/?service=${srv.id}#estimate-calculator`}>
                    <Button size="sm" className="font-bold gap-1.5 rounded-xl shadow-sm shadow-blue-600/20">
                      <span>Get Estimate</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Emergency Dispatch Hotline Strip */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>24/7 Immediate Vehicle Dispatch</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Need urgent recovery right now?
          </h3>
          <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
            Our central dispatch assigns the closest hydraulic flatbed or technician within 20 minutes across major highways and metro regions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href={`tel:${siteConfig.emergencyPhoneRaw}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold px-6 py-3.5 text-sm shadow-lg transition-transform active:scale-95"
          >
            <PhoneCall className="h-4 w-4 text-blue-600" />
            <span>Call {siteConfig.emergencyPhone}</span>
          </a>
          <Link
            href="/#estimate-calculator"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold px-6 py-3.5 text-sm border border-white/20 transition-all"
          >
            <span>Live Estimate</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
