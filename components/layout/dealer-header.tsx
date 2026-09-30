"use client";

import React, { useState } from "react";
import { getClientSession } from "@/lib/auth/session";
import { Wallet, Menu, ShieldCheck, Bell } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface DealerHeaderProps {
  onOpenMobileSidebar: () => void;
}

export function DealerHeader({ onOpenMobileSidebar }: DealerHeaderProps) {
  const session = getClientSession();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            {session?.businessName || "Apex Motors Autocare"}
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span className="font-semibold text-emerald-700">Verified Gold Partner</span>
            <span>•</span>
            <span className="font-mono text-slate-400">ID: {session?.dealerId || "DLR-9941"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Wallet Quick Balance */}
        <Link
          href="/dealer/wallet"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/15 transition-colors"
        >
          <Wallet className="h-4 w-4 text-primary" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider block leading-none">
              Wallet
            </span>
            <span className="text-xs font-black text-slate-900 leading-tight">
              ₹24,500
            </span>
          </div>
        </Link>

        {/* Profile Avatar */}
        <Link
          href="/dealer/profile"
          className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs hover:ring-2 hover:ring-primary transition-all"
        >
          AP
        </Link>
      </div>
    </header>
  );
}
