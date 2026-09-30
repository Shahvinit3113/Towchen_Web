import React from "react";
import Link from "next/link";
import { Truck, Phone, ShieldCheck } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-[#070f26] text-slate-300 pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/30">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Tow<span className="text-primary">Chen</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Fast, reliable towing and emergency roadside assistance available 24/7/365. Upfront pricing, real-time tracking, and certified drivers.
            </p>

            <div className="pt-2">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                24/7 Emergency Dispatch
              </p>
              <a
                href="tel:8005551234"
                className="text-xl font-black text-white hover:text-primary transition-colors flex items-center gap-2 mt-1"
              >
                <Phone className="h-5 w-5 text-primary" />
                <span>(800) 555-1234</span>
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
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Press & Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Track My Tow
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Request Invoice
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Insurance Claims
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 TowChen Technologies. All rights reserved.</p>
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
