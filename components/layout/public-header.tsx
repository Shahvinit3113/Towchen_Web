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
            ? "bg-[#070f26]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20 text-white"
            : isHome
            ? mobileMenuOpen
              ? "bg-[#070f26] border-b border-white/10 text-white"
              : "bg-transparent border-b-0 border-transparent shadow-none text-white"
            : "bg-[#070f26] border-b border-white/10 text-white"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center group shrink-0">
              <Image
                src="/NEXPOW.png"
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
                    className={`text-sm font-medium transition-colors ${
                      isDealer
                        ? "text-primary/90 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 shrink-0"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {isDealer && <ShieldCheck className="h-3.5 w-3.5" />}
                    <span>{link.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right: Phone Link */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0">
              <a
                href={`tel:${siteConfig.emergencyPhoneRaw}`}
                className="flex items-center gap-1.5 xl:gap-2 text-sm font-bold text-slate-200 hover:text-white transition-colors"
                title="Call 24/7 Dispatch"
              >
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>{siteConfig.emergencyPhone}</span>
              </a>
            </div>

            {/* Mobile / Tablet Right Controls: Hamburger */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -mr-1 rounded-lg text-slate-200 hover:text-white hover:bg-white/10"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-white/10 bg-[#070f26] px-4 pt-2 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white active:bg-white/15"
                >
                  <span>{link.title}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </nav>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <a
                href={`tel:${siteConfig.emergencyPhoneRaw}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary active:bg-primary-hover text-white font-black text-sm shadow-md shadow-primary/25"
              >
                <Phone className="h-4 w-4" />
                <span>Emergency Dispatch: {siteConfig.emergencyPhone}</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
