"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dealerLoginSchema, DealerLoginFormData } from "@/lib/validations";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, ShieldCheck, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DealerLoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DealerLoginFormData>({
    resolver: zodResolver(dealerLoginSchema),
    defaultValues: {
      email: "dealer@towchen.com",
      password: "Password@123",
    },
  });

  const handleLogin = async (credentials: DealerLoginFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await authApi.loginDealer(credentials);
      window.location.href = "/dealer/dashboard";
    } catch (err: any) {
      setAuthError(err.message || "Invalid dealer credentials.");
      setIsLoading(false);
    }
  };

  const onSubmit = (data: DealerLoginFormData) => {
    handleLogin(data);
  };

  const handleQuickDemoLogin = () => {
    setValue("email", "dealer@towchen.com");
    setValue("password", "Password@123");
    handleLogin({
      email: "dealer@towchen.com",
      password: "Password@123",
    });
  };

  const handleOfflineFallbackLogin = () => {
    setValue("email", "partner@apexmotors.com");
    setValue("password", "password123");
    handleLogin({
      email: "partner@apexmotors.com",
      password: "password123",
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-b from-primary/5 via-slate-50 to-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl blue-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Truck className="h-6 w-6" />
            </div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              Tow<span className="text-primary">Chen</span>
            </span>
          </Link>
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Authorized Dealer Partner Portal
          </p>
        </div>

        {/* Card */}
        <Card className="border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-8 bg-white rounded-3xl">
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              Dealer Sign In
            </h2>
            <p className="text-xs text-slate-500">
              Access your protected vehicle inventory, package commissions, and wallet payouts.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Business Email</span>
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="partner@dealership.com"
                error={errors.email?.message}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact your TowChen account manager to reset credentials.");
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold shadow-md shadow-primary/20 mt-2"
              isLoading={isLoading}
            >
              <span>Access Partner Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          {/* Demo account badge */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Demo Dealer Credentials Loaded</span>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="cursor-pointer"
            >
              <Badge variant="success" className="hover:bg-emerald-100 transition-colors">
                ⚡ Instant Demo Login
              </Badge>
            </button>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Return to TowChen Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
