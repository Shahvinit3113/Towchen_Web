"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminNavLinks } from "@/config/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Percent,
  Banknote,
  Scale,
  LogOut,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const ADMIN_ICONS: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  ShoppingBag: <ShoppingBag className="h-4 w-4" />,
  Percent: <Percent className="h-4 w-4" />,
  Banknote: <Banknote className="h-4 w-4" />,
  Scale: <Scale className="h-4 w-4" />,
};

interface AdminSidebarProps {
  onItemClick?: () => void;
}

export function AdminSidebar({ onItemClick }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/admin/login");
  };

  return (
    <aside className="w-64 h-full bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800">
      <div>
        <div className="p-6 border-b border-slate-800/80">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                Tow<span className="text-red-500">Admin</span>
              </span>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Platform Ops HQ
              </span>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {adminNavLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                  isActive
                    ? "bg-red-600 text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                )}
              >
                {item.icon && ADMIN_ICONS[item.icon]}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
        >
          <span>Live Customer Portal</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Admin Logout</span>
        </button>
      </div>
    </aside>
  );
}
