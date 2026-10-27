"use client";

import React, { useEffect, useState } from "react";
import { dealerApi } from "@/lib/api/dealer";
import { DealerAuthUser } from "@/types";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Calendar,
  RefreshCw,
} from "lucide-react";

export default function DealerProfilePage() {
  const [profile, setProfile] = useState<DealerAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchProfile = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await dealerApi.getAccountDetails();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load dealer profile:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading profile details...</p>
      </div>
    );
  }

  const dealerId = profile?.formated_id || (profile?.id ? `DLR-${profile.id}` : "DLR-9941");
  const businessName = profile?.businessName || profile?.name || "Dealership Partner";
  const contactPerson = profile?.name || "Authorized Dealer";
  const primaryPhone = profile?.number || profile?.phone || "Not specified";
  const email = profile?.email || "dealer@nexttow.com";
  const address = profile?.residential_address || "Not specified";
  const registeredDate = profile?.created_at ? formatDate(String(profile.created_at)) : null;

  return (
    <div className="w-full max-w-4xl space-y-4 sm:space-y-6 pb-8 sm:pb-12">
      {/* Page Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Dealer Profile
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <Lock className="h-3 w-3 text-slate-500" />
              <span>Read-Only</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Your registered dealership identity and basic account details.
          </p>
        </div>

        <div className="self-start xs:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProfile(true)}
            disabled={refreshing}
            className="text-xs font-semibold gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-xs overflow-hidden">
        {/* Top Identity Banner */}
        <div className="p-4 sm:p-6 md:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50/60 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            {/* Avatar / Initials */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-xs shrink-0">
              {businessName.substring(0, 2).toUpperCase()}
            </div>

            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">
                  {contactPerson}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                {businessName}
              </p>
            </div>
          </div>

          {/* Formatted Dealer ID Badge */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100/80 border border-slate-200/60 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0.5 shrink-0 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Dealer ID
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-mono text-sm font-black text-slate-900">
                {dealerId}
              </span>
              <button
                onClick={() => handleCopy(dealerId, "dealerId")}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Copy Dealer ID"
              >
                {copiedKey === "dealerId" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Basic Details Grid */}
        <div className="p-4 sm:p-6 md:p-7 space-y-3.5 sm:space-y-4">
          <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Dealer Name */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Full Name</span>
              </div>
              <p className="text-sm font-bold text-slate-900 break-words">
                {contactPerson}
              </p>
            </div>

            {/* Dealership Business Name */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Dealership / Business</span>
              </div>
              <p className="text-sm font-bold text-slate-900 break-words">
                {businessName}
              </p>
            </div>

            {/* Email Address */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Email Address</span>
                </div>
                <button
                  onClick={() => handleCopy(email, "email")}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer shrink-0"
                >
                  {copiedKey === "email" ? (
                    <span className="text-emerald-600 font-bold">Copied</span>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
              <p className="text-sm font-bold text-slate-900 break-all">
                {email}
              </p>
            </div>

            {/* Contact Phone */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Phone Number</span>
                </div>
                <button
                  onClick={() => handleCopy(primaryPhone, "phone")}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer shrink-0"
                >
                  {copiedKey === "phone" ? (
                    <span className="text-emerald-600 font-bold">Copied</span>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
              <p className="text-sm font-bold text-slate-900 break-words">
                {primaryPhone}
              </p>
            </div>

            {/* Address */}
            <div className="sm:col-span-2 p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Operating Address</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed break-words">
                {address}
              </p>
            </div>

            {/* Member Since (if available) */}
            {registeredDate && (
              <div className="sm:col-span-2 p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Member Since</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">{registeredDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Read-Only Footer Notice */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="leading-snug">Profile details are read-only and cannot be edited directly.</span>
          </div>
          <span className="leading-snug">
            Need changes? Contact{" "}
            <a
              href={`mailto:partners@nexttow.com?subject=Profile%20Update%20Request%20-%20${encodeURIComponent(
                dealerId
              )}`}
              className="text-primary font-bold hover:underline break-all"
            >
              partners@nexttow.com
            </a>
          </span>
        </div>
      </Card>
    </div>
  );
}
