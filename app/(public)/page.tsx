import React from "react";
import Link from "next/link";
import { constructMetadata, generateLocalBusinessSchema } from "@/config/seo";
import { EstimateWidget } from "@/components/estimate/estimate-widget";
import {
  Truck,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  BatteryCharging,
  Disc,
  Fuel,
  Key,
  Shield,
  Star,
  ArrowRight,
  Car,
  MapPin,
} from "lucide-react";

export const metadata = constructMetadata({
  title: "SwiftTow — 24/7 Towing Service & Emergency Roadside Assistance",
  description:
    "Fast, reliable towing and roadside assistance with upfront pricing and real-time driver tracking. Average 20 minute arrival.",
  canonicalUrlRelative: "",
});

export default function HomePage() {
  const localBusinessSchema = generateLocalBusinessSchema();

  const services = [
    {
      id: "flatbed-towing",
      title: "Flatbed Towing",
      desc: "Safe transport for all vehicle types including luxury, AWD, and lowered cars.",
      icon: Truck,
      href: "/services#flatbed-towing",
    },
    {
      id: "jumpstart",
      title: "Jump Start",
      desc: "Fast battery boost to get you back on the road in minutes.",
      icon: BatteryCharging,
      href: "/services#jumpstart",
    },
    {
      id: "flat-tire",
      title: "Tire Change",
      desc: "Roadside tire swap with your spare — quick and safe.",
      icon: Disc,
      href: "/services#flat-tire",
    },
    {
      id: "fuel-delivery",
      title: "Fuel Delivery",
      desc: "Emergency fuel delivered to your exact location, any time.",
      icon: Fuel,
      href: "/services#fuel-delivery",
    },
    {
      id: "lockout",
      title: "Lockout Service",
      desc: "Professional unlock for cars, trucks, and commercial vehicles.",
      icon: Key,
      href: "/services#lockout",
    },
    {
      id: "accident-recovery",
      title: "Vehicle Recovery",
      desc: "Off-road, ditch, and accident recovery by certified operators.",
      icon: Shield,
      href: "/services#accident-recovery",
    },
  ];

  const whyChoosePoints = [
    {
      title: "Upfront Transparent Pricing",
      desc: "Know your exact cost before we arrive. No surprise fees.",
    },
    {
      title: "Licensed & Insured Operators",
      desc: "Every driver is background-checked, certified, and fully insured.",
    },
    {
      title: "Real-Time GPS Tracking",
      desc: "Watch your driver approach on a live map — just like a rideshare.",
    },
    {
      title: "Damage-Free Guarantee",
      desc: "Our flatbeds and rigging protect your vehicle during every transport.",
    },
    {
      title: "Nationwide Coverage Network",
      desc: "Thousands of certified partners across all major metropolitan regions.",
    },
  ];

  const testimonials = [
    {
      name: "Marcus D.",
      location: "Atlanta, GA",
      review:
        "Driver arrived in 18 minutes at 2am on a Sunday. Professional, fast, and my car was loaded without a scratch. Highly recommend.",
      rating: 5,
    },
    {
      name: "Sarah T.",
      location: "Dallas, TX",
      review:
        "Used the estimate tool before calling — price matched exactly. No hidden fees. Best towing experience I've ever had.",
      rating: 5,
    },
    {
      name: "James R.",
      location: "Miami, FL",
      review:
        "Battery died in a parking garage. Tech showed up in 22 minutes, jumped the car, checked the charging system, and had me on my way.",
      rating: 5,
    },
    {
      name: "Priya K.",
      location: "Chicago, IL",
      review:
        "The app-like estimate widget sold me. Clear pricing upfront, real ETA, driver tracking. Feels like Uber for towing.",
      rating: 5,
    },
  ];

  return (
    <>
      {/* Structured SEO Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* 1. HERO SECTION - Desktop 2-column & Compact Mobile Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b193c] via-[#0d2154] to-[#071330] text-white pt-24 pb-10 sm:pt-28 sm:pb-14 lg:pt-40 lg:pb-24 lg:min-h-[760px] xl:min-h-[820px] lg:flex lg:items-center border-b border-white/10">
        {/* Subtle background glow & radial gradient */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary rounded-full blur-[140px]" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-secondary rounded-full blur-[160px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
            {/* Left Column: Hero Text & CTAs */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              {/* Status Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-xs font-semibold backdrop-blur-md">
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500" />
                </span>
                <span className="text-slate-200">
                  Available 24/7 — <strong className="text-white">Avg. 20 Min Arrival</strong>
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.15]">
                <span className="text-white block">Need a Tow?</span>
                <span className="text-[#a5c4ff] block">We&apos;re Ready to Help.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Fast, reliable towing and roadside assistance when you need it most — with upfront pricing and real-time driver tracking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <a
                  href="tel:8005551234"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary hover:bg-secondary text-white font-bold py-4 px-8 text-base shadow-lg shadow-primary/30 transition-all active:scale-95"
                >
                  <Phone className="h-5 w-5" />
                  <span>CALL NOW</span>
                </a>

                <a
                  href="#estimate-calculator"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/30 font-bold py-4 px-8 text-base backdrop-blur-sm transition-all active:scale-95"
                >
                  GET A TOWING ESTIMATE
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-2 text-center lg:text-left">
                <div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white">40K+</p>
                  <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wide mt-0.5">Tows Completed</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 flex items-center justify-center lg:justify-start gap-1">
                    4.9<span className="text-amber-400 text-xs sm:text-sm">★</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wide mt-0.5">Customer Rating</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white">24/7</p>
                  <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wide mt-0.5">Always Available</p>
                </div>
              </div>
            </div>

            {/* Right Column: Estimate Calculator Card (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-5 w-full max-w-lg mx-auto" id="estimate-calculator-desktop">
              <EstimateWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Dedicated Estimate Widget Section (Below Hero) */}
      <section className="lg:hidden py-10 px-4 sm:px-6 bg-[#f4f7fc] border-b border-slate-200" id="estimate-calculator">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6 space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Get Your Estimate
            </h2>
            <p className="text-sm text-slate-500">
              Upfront pricing, no surprises
            </p>
          </div>
          <EstimateWidget />
        </div>
      </section>

      {/* 2. KEY METRICS STRIP */}
      <section className="bg-[#f4f7fe] py-8 sm:py-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            <div className="bg-white lg:bg-transparent rounded-2xl lg:rounded-none p-4 sm:p-5 lg:p-0 border border-slate-200/80 lg:border-0 lg:border-r lg:border-slate-200/80 lg:pr-6 text-center lg:text-left shadow-xs lg:shadow-none">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">20 Min</p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-snug">Average Arrival Time (metro areas)</p>
            </div>
            <div className="bg-white lg:bg-transparent rounded-2xl lg:rounded-none p-4 sm:p-5 lg:p-0 border border-slate-200/80 lg:border-0 lg:border-r lg:border-slate-200/80 lg:pr-6 text-center lg:text-left shadow-xs lg:shadow-none">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">40,000+</p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-snug">Vehicles Towed (and counting)</p>
            </div>
            <div className="bg-white lg:bg-transparent rounded-2xl lg:rounded-none p-4 sm:p-5 lg:p-0 border border-slate-200/80 lg:border-0 lg:border-r lg:border-slate-200/80 lg:pr-6 text-center lg:text-left shadow-xs lg:shadow-none">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">4.9 / 5</p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-snug">Customer Rating (8,200+ reviews)</p>
            </div>
            <div className="bg-white lg:bg-transparent rounded-2xl lg:rounded-none p-4 sm:p-5 lg:p-0 border border-slate-200/80 lg:border-0 text-center lg:text-left shadow-xs lg:shadow-none">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600">98.6%</p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-snug">On-Time Arrival (last 12 months)</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHAT WE DO (COMPLETE ROADSIDE COVERAGE) */}
      <section className="py-14 sm:py-20 bg-white" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              WHAT WE DO
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Complete Roadside Coverage
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              From flatbed towing to emergency lockout — one call covers everything.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {services.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100">
                    <Link
                      href={srv.href}
                      className="text-xs sm:text-sm font-bold text-primary hover:text-secondary inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Learn more</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SIMPLE PROCESS (HELP IN 3 STEPS) */}
      <section className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              SIMPLE PROCESS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Help in 3 Steps
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Fast, transparent roadside assistance dispatched straight to your vehicle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3 sm:space-y-4 text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary font-black text-base sm:text-lg flex items-center justify-center mx-auto shadow-xs">
                01
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Get Instant Estimate</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Enter your pickup and drop-off to receive an accurate, upfront price in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3 sm:space-y-4 text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary text-white font-black text-base sm:text-lg flex items-center justify-center mx-auto shadow-md shadow-primary/30">
                02
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Driver Dispatched</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A certified, background-checked driver is assigned and on the way — avg. 20 minutes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3 sm:space-y-4 text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-50 text-emerald-600 font-black text-base sm:text-lg flex items-center justify-center mx-auto shadow-xs">
                03
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Vehicle Delivered</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Real-time GPS tracking until your vehicle is safely delivered. Pay after service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY SWIFTTOW (PREMIUM STANDARD) */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Points */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                WHY SWIFTTOW
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                The Premium Standard in Roadside Assistance
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                We set the benchmark for modern emergency logistics with technology, vetted drivers, and total transparency.
              </p>

              <div className="space-y-3 sm:space-y-4 pt-1">
                {whyChoosePoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-3 sm:gap-3.5">
                    <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">{pt.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{pt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual Container with Floating Badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#0b193c] to-[#071330] p-6 sm:p-8 text-white min-h-[340px] sm:min-h-[400px] flex flex-col justify-between shadow-2xl border border-white/10">
                <div className="space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    <Truck className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    SwiftTow Certified Fleet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Heavy-duty hydraulic flatbeds, soft wheel-strapping systems, and GPS telemetry active 24/7.
                  </p>
                </div>

                {/* Floating Glass ETA Card */}
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3.5">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-primary text-white shrink-0">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-300 tracking-wider">
                      Avg. Arrival
                    </span>
                    <p className="text-lg sm:text-xl font-black text-white">20 Minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REAL REVIEWS (TRUSTED BY THOUSANDS) */}
      <section className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              REAL REVIEWS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Trusted by Thousands
            </h2>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 ml-1">4.9</span>
              <span className="text-xs sm:text-sm text-slate-500">from 8,200+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>
                <div className="pt-3 sm:pt-4 border-t border-slate-100 mt-4">
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. COVERAGE MAP CALLOUT */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-200" id="coverage">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#f4f7fe] border border-slate-200">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <MapPin className="h-4 w-4" />
                <span>Extensive Coverage Area</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Operating Across All Major Metropolitan Corridors
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Stationed at key highway junctions and city intersections for rapid arrival.
              </p>
            </div>
            <Link
              href="/locations"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 text-sm shrink-0 transition-all"
            >
              <span>Explore Coverage Zones</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. EMERGENCY CALLOUT BANNER (PRIMARY BLUE) */}
      <section className="py-12 sm:py-16 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-white">
            <Car className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Stuck on the Road? Help is One Call Away.
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
            Available 24 hours a day, 7 days a week. A driver is always ready.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <a
              href="tel:8005551234"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-slate-100 text-primary font-black px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span>CALL NOW — (800) 555-1234</span>
            </a>

            <a
              href="#estimate-calculator"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary hover:bg-secondary text-white border-2 border-white/40 font-bold px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base transition-colors"
            >
              Get Estimate →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
