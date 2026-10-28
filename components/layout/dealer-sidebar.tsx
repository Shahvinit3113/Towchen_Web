"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { dealerNavLinks } from "@/config/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  History,
  MessageSquare,
  LogOut,
  ExternalLink,
  User,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  ShieldCheck: <ShieldCheck className="h-4 w-4" />,
  History: <History className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
};

interface DealerSidebarProps {
  onItemClick?: () => void;
}

export function DealerSidebar({ onItemClick }: DealerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/dealer/login");
  };

  return (
    <aside className="w-64 h-full bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800">
      <div>
        {/* Dealer Portal Branding */}
        <div className="p-6 border-b border-slate-800/80">
          <Link href="/dealer/dashboard" className="block space-y-2 group">
            <Image
              src="/NEXPOW1.png"
              alt="NextTow"
              width={140}
              height={30}
              priority
              unoptimized
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="inline-block text-[10px] uppercase font-bold text-blue-400 tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              Dealer Partner OS
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {dealerNavLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                  isActive
                    ? "bg-primary text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                )}
              >
                {item.icon && ICONS[item.icon]}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls: Back to public site & logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <span>Public Website</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
