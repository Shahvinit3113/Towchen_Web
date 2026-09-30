"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getClientSession } from "@/lib/auth/session";
import { authApi } from "@/lib/api/auth";
import { DealerSidebar } from "@/components/layout/dealer-sidebar";
import { DealerHeader } from "@/components/layout/dealer-header";
import { X } from "lucide-react";

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/dealer/login";

  useEffect(() => {
    const session = getClientSession();
    if (isLoginPage) {
      if (session && (session.role === "dealer" || session.role === "admin")) {
        router.replace("/dealer/dashboard");
      }
    } else {
      if (!session || (session.role !== "dealer" && session.role !== "admin")) {
        router.replace("/dealer/login");
      } else {
        setAuthVerified(true);
        // Verify and refresh dealer profile with GET /dealer-auth/me
        if (session.token && session.role === "dealer") {
          authApi.refreshDealerSession().catch((err: any) => {
            if (err?.status === 401) {
              router.replace("/dealer/login");
            }
          });
        }
      }
    }
  }, [pathname, isLoginPage, router]);

  // Login page has its own minimal focused layout
  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  // Prevent flash before auth verification
  if (!authVerified) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Authenticating...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <DealerSidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-slate-900 shadow-2xl flex flex-col">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <DealerSidebar onItemClick={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <DealerHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
