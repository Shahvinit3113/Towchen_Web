"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, Menu, X, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { title: "Services", href: "/#services" },
    { title: "Coverage", href: "/#coverage" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
    { title: "Dealer Portal", href: "/dealer/login" },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full h-20 transition-all duration-300",
          isHome && "-mb-20",
          isScrolled
            ? "bg-[#003EF9]/95 backdrop-blur-md border-b border-white/20 shadow-lg shadow-[#003EF9]/25 text-white"
            : isHome
            ? mobileMenuOpen
              ? "bg-[#003EF9] border-b border-white/20 text-white"
              : "bg-transparent border-b-0 border-transparent shadow-none text-white"
            : "bg-[#003EF9] border-b border-white/20 text-white"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center group shrink-0">
              <Image
                src="/NEXPOW1.png"
                alt="NextTow"
                width={160}
                height={34}
                priority
                unoptimized
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-7">
              {navLinks.map((link) => {
                const isDealer = link.title === "Dealer Portal";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-semibold transition-colors ${
                      isDealer
                        ? "text-white hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 shrink-0 backdrop-blur-xs"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    {isDealer && <ShieldCheck className="h-3.5 w-3.5 text-white" />}
                    <span>{link.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right: Phone Link */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0">
              <a
                href={`tel:${siteConfig.emergencyPhoneRaw}`}
                className="flex items-center gap-1.5 xl:gap-2 text-sm font-bold text-white hover:text-white/90 transition-colors bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl border border-white/20 backdrop-blur-xs"
                title="Call 24/7 Dispatch"
              >
                <Phone className="h-4 w-4 text-white shrink-0" />
                <span>{siteConfig.emergencyPhone}</span>
              </a>
            </div>

            {/* Mobile / Tablet Right Controls: Hamburger */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -mr-1 rounded-lg text-white hover:bg-white/15 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-white/20 bg-[#003EF9] px-4 pt-2 pb-6 space-y-3 shadow-2xl">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/15 active:bg-white/20 transition-colors"
                >
                  <span>{link.title}</span>
                  <ChevronRight className="h-4 w-4 text-white/70" />
                </Link>
              ))}
            </nav>
            <div className="pt-2 border-t border-white/20 flex flex-col gap-2">
              <a
                href={`tel:${siteConfig.emergencyPhoneRaw}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#003EF9] font-black text-sm shadow-md active:scale-[0.99] transition-all"
              >
                <Phone className="h-4 w-4 text-[#003EF9]" />
                <span>Emergency Dispatch: {siteConfig.emergencyPhone}</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
