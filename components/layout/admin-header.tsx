"use client";

import React from "react";
import { getClientSession } from "@/lib/auth/session";
import { ShieldAlert, Menu, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
}

export function AdminHeader({ onOpenMobileSidebar }: AdminHeaderProps) {
  const session = getClientSession();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Central Dispatch & Fleet Administration
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              API Services Online
            </span>
            <span>•</span>
            <span>Session: {session?.name || "Super Administrator"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="danger" className="text-[11px] font-mono">
          SuperAdmin Mode
        </Badge>
      </div>
    </header>
  );
}
