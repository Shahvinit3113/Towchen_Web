import React from "react";
import { constructMetadata } from "@/config/seo";
import { Badge } from "@/components/ui/badge";
import { ServicesCatalog } from "@/components/services/services-catalog";

export const metadata = constructMetadata({
  title: "Complete Emergency Towing & Roadside Assistance Fleet Catalog",
  description:
    "Explore our live dynamic suite of vehicle assistance services: flatbed hydraulic towing, underground clearance, battery jumpstarts, and accident recovery with upfront rates.",
  canonicalUrlRelative: "/services",
});

export default function ServicesPage() {
  return (
    <div className="py-12 md:py-16 space-y-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <Badge variant="primary">Dynamic Fleet & Service Directory</Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            All Roadside Assistance & Recovery Services
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Every vehicle breakdown is unique. Discover our specialized transport,
            crane recovery, and on-demand roadside repair fleet with real-time upfront pricing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ServicesCatalog />
      </div>
    </div>
  );
}

