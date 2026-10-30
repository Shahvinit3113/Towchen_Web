"use client";

import React, { useState } from "react";
import { getClientSession } from "@/lib/auth/session";
import { Wallet, Menu, ShieldCheck, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface DealerHeaderProps {
  onOpenMobileSidebar: () => void;
}

export function DealerHeader({ onOpenMobileSidebar }: DealerHeaderProps) {
  const session = getClientSession();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 gap-2 sm:gap-4">
      {/* Left: Mobile Menu Button + Dealer Business Identity */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 active:scale-95 transition-transform"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href="/dealer/dashboard"
          className="lg:hidden flex items-center px-2 py-1 rounded-lg bg-[#003EF9] shrink-0"
        >
          <Image
            src="/NEXPOW1.png"
            alt="NextTow"
            width={90}
            height={20}
            priority
            unoptimized
            className="h-4.5 w-auto object-contain"
          />
        </Link>

        {/* <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
            {session?.businessName || "Apex Motors Autocare"}
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 shrink-0">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span className="hidden sm:inline">Verified Gold Partner</span>
              <span className="sm:hidden">Verified</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-400 truncate">
              {session?.dealerId || "DLR-9941"}
            </span>
          </div>
        </div> */}
      </div>

      {/* Right: Wallet Balance & Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Wallet Quick Balance */}
        <Link
          href="/dealer/wallet"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors shrink-0"
        >
          <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          <div className="text-right">
            <span className="hidden sm:block text-[9px] uppercase font-bold text-primary tracking-wider leading-none">
              Wallet
            </span>
            <span className="text-xs font-black text-slate-900 leading-tight whitespace-nowrap">
              ₹24,500
            </span>
          </div>
        </Link>

        {/* Profile Avatar */}
        <Link
          href="/dealer/profile"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs hover:ring-2 hover:ring-primary transition-all shrink-0"
        >
          {session?.businessName ? session.businessName.substring(0, 2).toUpperCase() : "AP"}
        </Link>
      </div>
    </header>
  );
}
