import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

export function PublicFooter() {
  return (
    <footer className="bg-[#070f26] text-slate-300 pt-12 sm:pt-16 pb-24 sm:pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <Image
                src="/NEXPOW.png"
                alt="NextTow"
                width={170}
                height={36}
                unoptimized
                className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Fast, reliable towing and emergency roadside assistance available 24/7/365. Upfront pricing, real-time tracking, and certified drivers.
            </p>

            <div className="pt-2">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                24/7 Emergency Dispatch
              </p>
              <a
                href={`tel:${siteConfig.emergencyPhoneRaw}`}
                className="text-xl font-black text-white hover:text-primary transition-colors flex items-center gap-2 mt-1"
              >
                <Phone className="h-5 w-5 text-primary" />
                <span>{siteConfig.emergencyPhone}</span>
              </a>
            </div>

            <div className="pt-2">
              <Link
                href="/dealer/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Dealer Partner Portal Login →</span>
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/services#flatbed-towing" className="hover:text-white transition-colors">
                  Flatbed Towing
                </Link>
              </li>
              <li>
                <Link href="/services#jumpstart" className="hover:text-white transition-colors">
                  Jump Start
                </Link>
              </li>
              <li>
                <Link href="/services#flat-tire" className="hover:text-white transition-colors">
                  Tire Change
                </Link>
              </li>
              <li>
                <Link href="/services#fuel-delivery" className="hover:text-white transition-colors">
                  Fuel Delivery
                </Link>
              </li>
              <li>
                <Link href="/services#lockout" className="hover:text-white transition-colors">
                  Lockout Service
                </Link>
              </li>
              <li>
                <Link href="/services#accident-recovery" className="hover:text-white transition-colors">
                  Vehicle Recovery
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/locations" className="hover:text-white transition-colors">
                  Coverage Map
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link href="/dealer/login" className="hover:text-white transition-colors">
                  Dealer & Fleet Accounts
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 NextTow Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="hover:text-slate-400 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
