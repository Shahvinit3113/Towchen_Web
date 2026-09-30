"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, AdminLoginFormData } from "@/lib/validations";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "admin@towchain.com",
      password: "adminpassword",
    },
  });

  const handleAdminLogin = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await authApi.loginAdmin(data);
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setAuthError(err.message || "Invalid admin credentials.");
      setIsLoading(false);
    }
  };

  const onSubmit = (data: AdminLoginFormData) => {
    handleAdminLogin(data);
  };

  const handleQuickDemoAdminLogin = () => {
    handleAdminLogin({
      email: "admin@towchain.com",
      password: "adminpassword",
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-950 text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-red-600/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            TowChain Central Dispatch Ops
          </h1>
          <p className="text-xs uppercase font-bold text-red-400 tracking-wider">
            SuperAdmin & Platform Controller Access
          </p>
        </div>

        <Card className="border border-slate-800 bg-slate-900 p-7 sm:p-8 rounded-3xl space-y-6 text-slate-200">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Sign In to Fleet Ops</h2>
            <p className="text-xs text-slate-400">
              Restricted to authorized dispatch coordinators and operations staff.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>Admin Email</span>
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="admin@towchain.com"
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                error={errors.email?.message}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Admin Secret Key</span>
              </label>
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••••••"
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                error={errors.password?.message}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
              isLoading={isLoading}
            >
              <span>Authenticate Ops Console</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Development Mode Active</span>
            <button
              type="button"
              onClick={handleQuickDemoAdminLogin}
              className="cursor-pointer"
            >
              <Badge variant="danger" className="hover:bg-red-900 transition-colors">
                ⚡ Instant Ops Login
              </Badge>
            </button>
          </div>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-300"
          >
            ← Return to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
