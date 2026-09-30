"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { PhoneCall, Truck } from "lucide-react";

export function MobileActionBar() {
  return (
    <aside
      aria-label="Emergency quick actions"
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="grid grid-cols-2 gap-2.5">
        {/* CALL NOW BUTTON */}
        <a
          href={`tel:${siteConfig.emergencyPhoneRaw}`}
          id="btn-mobile-call-now"
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white shadow-md shadow-red-600/25 active:scale-95 transition-transform"
        >
          <PhoneCall className="h-4 w-4 animate-bounce" />
          <span>CALL NOW</span>
        </a>

        {/* SERVICES BUTTON */}
        <Link
          href="/services"
          id="btn-mobile-services"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-white shadow-md shadow-primary/25 active:scale-95 transition-transform"
        >
          <Truck className="h-4 w-4" />
          <span>OUR SERVICES</span>
        </Link>
      </div>
    </aside>
  );
}
