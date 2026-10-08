import React from "react";
import { constructMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneCall, Mail, MapPin, Clock, Headphones } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata = constructMetadata({
  title: "24/7 Roadside Assistance Support & Emergency Contact",
  description:
    "Get in touch with TowChen central dispatch room, customer support, or dealership partnership coordinators.",
  canonicalUrlRelative: "/contact",
});

export default function ContactPage() {
  return (
    <div className="py-8 sm:py-12 md:py-16 space-y-10 sm:space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <Badge variant="primary">24/7 Live Assistance</Badge>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Contact TowChen Dispatch & Support
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed">
            Need an emergency tow right now? Call our priority hotline directly. For
            dealership partnerships or corporate fleet queries, submit a request
            below.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          {/* Direct channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl sm:rounded-3xl bg-red-50 border border-red-200 p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-bold uppercase text-xs tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                Emergency Hotline (24/7)
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {siteConfig.emergencyPhone}
              </h2>
              <p className="text-xs text-slate-600">
                Direct connection to central emergency dispatchers. Average pickup within 3 rings.
              </p>
              <a
                href={`tel:${siteConfig.emergencyPhoneRaw}`}
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3.5 text-sm shadow-md transition-all active:scale-95"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call Hotline Now</span>
              </a>
            </div>

            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 text-sm">
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider text-slate-400">
                Department Inquiries
              </h3>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <strong className="text-slate-900 block truncate">General & Billing Support:</strong>
                  <span className="text-slate-500 text-xs sm:text-sm truncate block">{siteConfig.supportEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Headphones className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <strong className="text-slate-900 block truncate">Dealer Partner Support:</strong>
                  <span className="text-slate-500 text-xs sm:text-sm truncate block">{siteConfig.dealerSupportEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Headquarters:</strong>
                  <span className="text-slate-500 text-xs sm:text-sm">
                    {siteConfig.headquarters.address}, {siteConfig.headquarters.city},{" "}
                    {siteConfig.headquarters.state} {siteConfig.headquarters.postalCode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Send Us a Message
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  For non-emergency fleet partnerships, insurance tie-ups, or feedback.
                </p>
              </div>

              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
