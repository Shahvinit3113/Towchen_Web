import React from "react";
import { constructMetadata, generateFaqSchema } from "@/config/seo";
import { FAQS } from "@/lib/constants/faq";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { PhoneCall } from "lucide-react";

export const metadata = constructMetadata({
  title: "Roadside Assistance & Towing FAQs | Common Questions Answered",
  description:
    "Find answers about TowChain towing costs, flatbed safety, EV handling, dealer commissions, and emergency response times.",
  canonicalUrlRelative: "/faq",
});

export default function FaqPage() {
  const faqSchema = generateFaqSchema(FAQS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="py-12 md:py-16 space-y-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="primary">Help & Knowledge Base</Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            Clear, transparent answers about our towing fleet standards, pricing,
            and dealership integrations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {faq.category}
                </Badge>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{faq.question}</h2>
              <p className="text-sm text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-3">
            <h3 className="text-xl font-bold text-slate-950">
              Still have an urgent breakdown question?
            </h3>
            <p className="text-sm text-primary">
              Our 24/7 hotline is staffed by experienced fleet controllers ready to help.
            </p>
            <a
              href={`tel:${siteConfig.emergencyPhoneRaw}`}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 text-sm shadow-md mt-2"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Call {siteConfig.emergencyPhone}</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
