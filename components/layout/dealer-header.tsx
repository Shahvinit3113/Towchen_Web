"use client";

import React from "react";
import { getClientSession } from "@/lib/auth/session";
import { Wallet, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface DealerHeaderProps {
  onOpenMobileSidebar: () => void;
}

export function DealerHeader({ onOpenMobileSidebar }: DealerHeaderProps) {
  const session = getClientSession();

  return (
    <header className="h-16 bg-[#003EF9] border-b border-white/20 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 gap-2 sm:gap-4 shadow-md shadow-[#003EF9]/15 text-white">
      {/* Left: Mobile Menu Button + Dealer Business Identity */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-white/25 text-white hover:bg-white/15 shrink-0 active:scale-95 transition-all cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>

        <Link
          href="/dealer/dashboard"
          className="lg:hidden flex items-center shrink-0"
        >
          <Image
            src="/NEXPOW1.png"
            alt="NextTow"
            width={100}
            height={22}
            priority
            unoptimized
            className="h-5 sm:h-5.5 w-auto object-contain"
          />
        </Link>

        {/* Desktop Dealer Info / Title */}
        <div className="hidden lg:flex items-center gap-2.5">
          {session?.businessName ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                {session.businessName}
              </span>
              <span className="text-[10px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-full border border-white/25">
                Dealer Partner
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-white/90">
              Dealer Partner OS
            </span>
          )}
        </div>
      </div>

      {/* Right: Wallet Balance & Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Wallet Quick Balance */}
        <Link
          href="/dealer/wallet"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 hover:bg-white/25 transition-all text-white backdrop-blur-xs shrink-0"
        >
          <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white shrink-0" />
          <div className="text-right">
            <span className="hidden sm:block text-[9px] uppercase font-bold text-white/80 tracking-wider leading-none">
              Wallet
            </span>
            <span className="text-xs font-black text-white leading-tight whitespace-nowrap">
              ₹24,500
            </span>
          </div>
        </Link>

        {/* Profile Avatar */}
        <Link
          href="/dealer/profile"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white text-[#003EF9] font-black text-xs flex items-center justify-center shadow-md hover:scale-105 hover:ring-2 hover:ring-white/80 transition-all shrink-0"
          title="Dealer Profile"
        >
          {session?.businessName ? session.businessName.substring(0, 2).toUpperCase() : "DE"}
        </Link>
      </div>
    </header>
  );
}
