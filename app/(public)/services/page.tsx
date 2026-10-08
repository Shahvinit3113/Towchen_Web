import React from "react";
import Link from "next/link";
import { constructMetadata } from "@/config/seo";
import { ALL_SERVICES } from "@/lib/constants/services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata = constructMetadata({
  title: "Complete Emergency Towing & Roadside Assistance Fleet Catalog",
  description:
    "Explore our full suite of vehicle assistance services: flatbed hydraulic towing, underground clearance, battery jumpstarts, and accident recovery.",
  canonicalUrlRelative: "/services",
});

export default function ServicesPage() {
  return (
    <div className="py-8 sm:py-12 md:py-16 space-y-8 sm:space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <Badge variant="primary">Fleet & Service Directory</Badge>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            All Roadside Assistance & Recovery Services
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
            Every vehicle breakdown is unique. Discover our specialized transport
            and roadside repair capabilities below.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ALL_SERVICES.map((srv) => (
            <div
              key={srv.id}
              id={srv.slug}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                    <Truck className="h-5 w-5" />
                  </div>
                  <Badge variant={srv.category === "towing" ? "primary" : "success"}>
                    {srv.category === "towing" ? "Towing Fleet" : "Roadside Patrol"}
                  </Badge>
                </div>

                <h2 className="text-xl font-bold text-slate-900">{srv.title}</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {srv.fullDesc}
                </p>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase text-slate-400">
                    Included Benefits:
                  </p>
                  {srv.features.map((f, i) => (
                    <div
                      key={i}
                      className="text-xs text-slate-700 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Base Fare
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{srv.basePrice}
                  </span>
                </div>
                <Link href="/contact">
                  <Button size="sm" className="font-semibold gap-1">
                    <span>Request Service</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
