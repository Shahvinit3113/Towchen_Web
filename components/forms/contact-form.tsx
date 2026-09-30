"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
        <h4 className="text-lg font-bold text-emerald-950">
          Inquiry Transmitted Successfully
        </h4>
        <p className="text-xs text-emerald-800 max-w-sm mx-auto">
          Our regional fleet controller will review your requirements and reach out within 15 minutes.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSubmitted(false)}
          className="mt-2"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" placeholder="Rajesh Kumar" required />
        <Input
          label="Phone Number"
          placeholder="9812345678"
          type="tel"
          required
        />
      </div>

      <Input
        label="Email Address"
        placeholder="rajesh@example.com"
        type="email"
        required
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Subject / Department
        </label>
        <select className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-primary focus:outline-none">
          <option>Dealership RSA Partnership</option>
          <option>Corporate Fleet Management</option>
          <option>Billing & Invoicing Query</option>
          <option>Customer Feedback</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Your Message
        </label>
        <textarea
          rows={4}
          placeholder="Provide details about your query..."
          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>

      <Button
        type="submit"
        size="lg"
        isLoading={isSubmitting}
        className="w-full font-bold"
      >
        Submit Inquiry
      </Button>
    </form>
  );
}
