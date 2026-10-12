"use client";

import React from "react";
import { siteConfig } from "@/config/site";
import { PhoneCall } from "lucide-react";

export function FloatingCallButton() {
  return (
    <aside
      aria-label="Emergency 24/7 Dispatch"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <a
        href={`tel:${siteConfig.emergencyPhoneRaw}`}
        id="btn-floating-call"
        aria-label="Call emergency dispatch 24/7"
        className="group flex items-center gap-2.5 rounded-full bg-primary hover:bg-primary-hover active:bg-blue-800 text-white font-black px-4.5 py-3.5 sm:px-5 sm:py-3.5 shadow-2xl shadow-primary/50 border border-white/20 active:scale-95 transition-all text-xs sm:text-sm tracking-wider"
      >
        <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-white" />
        </span>
        <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5 animate-bounce" />
        <span className="font-extrabold tracking-wide">CALL 24/7</span>
      </a>
    </aside>
  );
}
