"use client";

import React, { useState, useEffect } from "react";
import { dealerApi } from "@/lib/api/dealer";
import { DealerProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Building2,
  ShieldCheck,
  Landmark,
  User,
  Phone,
  Mail,
  MapPin,
  FileBadge,
  Save,
} from "lucide-react";

export default function DealerProfilePage() {
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await dealerApi.getProfile();
      setProfile(data);
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      const updated = await dealerApi.updateProfile(profile);
      setProfile(updated);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Dealership Profile & Verification
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your dealership legal credentials, commission tier, and payout bank accounts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dealership Info Card */}
        <Card className="p-6 border border-slate-200/90 rounded-3xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900">
                Business & Dealership Entity
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Verified Gold Partner</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dealership Legal Name"
              value={profile.businessName}
              onChange={(e) =>
                setProfile({ ...profile, businessName: e.target.value })
              }
              required
            />
            <Input
              label="Contact Representative"
              value={profile.contactPerson}
              onChange={(e) =>
                setProfile({ ...profile, contactPerson: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Email"
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              required
            />
            <Input
              label="Phone Number"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Registered Facility Address"
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
            />
            <Input
              label="City & State"
              value={profile.city}
              onChange={(e) =>
                setProfile({ ...profile, city: e.target.value })
              }
            />
          </div>

          <div>
            <Input
              label="GSTIN / Corporate Tax Number"
              value={profile.gstinOrTaxId}
              onChange={(e) =>
                setProfile({ ...profile, gstinOrTaxId: e.target.value })
              }
            />
          </div>
        </Card>

        {/* Bank Account Details Card */}
        <Card className="p-6 border border-slate-200/90 rounded-3xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Landmark className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900">
              Payout Beneficiary Account
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Account Holder Name"
              value={profile.bankDetails.accountHolderName}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  bankDetails: {
                    ...profile.bankDetails,
                    accountHolderName: e.target.value,
                  },
                })
              }
            />
            <Input
              label="Bank Name"
              value={profile.bankDetails.bankName}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  bankDetails: {
                    ...profile.bankDetails,
                    bankName: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Account Number"
              value={profile.bankDetails.accountNumber}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  bankDetails: {
                    ...profile.bankDetails,
                    accountNumber: e.target.value,
                  },
                })
              }
            />
            <Input
              label="IFSC Code"
              value={profile.bankDetails.ifscOrRouting}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  bankDetails: {
                    ...profile.bankDetails,
                    ifscOrRouting: e.target.value,
                  },
                })
              }
            />
          </div>
        </Card>

        <div className="flex items-center justify-between pt-2">
          {successMsg ? (
            <span className="text-xs text-emerald-600 font-bold">
              ✓ Profile changes saved successfully!
            </span>
          ) : (
            <span />
          )}

          <Button type="submit" size="lg" isLoading={isSaving} className="font-bold gap-2">
            <Save className="h-4 w-4" />
            <span>Save Profile Updates</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
