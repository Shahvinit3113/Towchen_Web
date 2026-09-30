"use client";

import React, { useState, useEffect } from "react";
import { vehiclesApi } from "@/lib/api/vehicles";
import { packagesApi } from "@/lib/api/packages";
import { VehicleRecord, RsaPackage, VehicleInspectionPhotos } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LiveVehicleCameraCapture } from "@/components/vehicle/live-camera-capture";
import { RcUpload } from "@/components/vehicle/rc-upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  CarFront,
  Plus,
  Camera,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleRegistrationSchema, VehicleRegistrationFormData } from "@/lib/validations";

export default function DealerVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [packages, setPackages] = useState<RsaPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeCameraVehicle, setActiveCameraVehicle] = useState<VehicleRecord | null>(null);
  const [activeRcVeh, setActiveRcVeh] = useState<VehicleRecord | null>(null);

  useEffect(() => {
    async function loadData() {
      const [vehs, pkgs] = await Promise.all([
        vehiclesApi.getVehicles(),
        packagesApi.getPackages(),
      ]);
      setVehicles(vehs);
      setPackages(pkgs);
    }
    loadData();
  }, []);

  // Form for vehicle registration
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleRegistrationFormData>({
    resolver: zodResolver(vehicleRegistrationSchema),
    defaultValues: {
      registrationNumber: "",
      vinOrChassis: "",
      make: "",
      model: "",
      year: 2024,
      category: "sedan",
    },
  });

  const onRegisterVehicle = async (data: VehicleRegistrationFormData) => {
    const assignedPkg = packages.find((p) => p.id === data.assignedPackageId);
    const created = await vehiclesApi.registerVehicle({
      dealerId: "dlr-9941",
      registrationNumber: data.registrationNumber,
      vinOrChassis: data.vinOrChassis,
      make: data.make,
      model: data.model,
      year: data.year,
      category: data.category,
      assignedPackageId: data.assignedPackageId,
      packageName: assignedPkg?.title,
    });

    setVehicles([created, ...vehicles]);
    setIsRegisterModalOpen(false);
    reset();
  };

  const handleInspectionComplete = async (photos: VehicleInspectionPhotos) => {
    if (!activeCameraVehicle) return;
    await vehiclesApi.uploadInspectionPhotos(activeCameraVehicle.id, photos);
    setVehicles(
      vehicles.map((v) =>
        v.id === activeCameraVehicle.id
          ? { ...v, inspectionPhotos: photos, status: "verified" }
        : v
      )
    );
    setActiveCameraVehicle(null);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vinOrChassis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || v.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Vehicle Fleet & RC Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register dealership vehicles, upload RC documents, and perform live 7-point camera audits.
          </p>
        </div>

        <Button
          onClick={() => setIsRegisterModalOpen(true)}
          size="md"
          className="font-bold gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Register Vehicle</span>
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plate, make, model or VIN..."
            className="pl-9 h-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Category:
          </span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Vehicles ({vehicles.length})</option>
            <option value="sedan">Sedans</option>
            <option value="suv">SUVs</option>
            <option value="luxury">Luxury</option>
            <option value="ev">Electric Vehicles</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </Card>

      {/* Vehicles Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Registration / VIN</th>
              <th className="py-3 px-4">Make & Model</th>
              <th className="py-3 px-4">RSA Package</th>
              <th className="py-3 px-4">RC Document</th>
              <th className="py-3 px-4">7-Point Inspection</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Audit Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredVehicles.map((veh) => (
              <tr key={veh.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <strong className="text-slate-900 block font-mono text-sm">
                    {veh.registrationNumber}
                  </strong>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {veh.vinOrChassis}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-slate-800 block">
                    {veh.make} {veh.model}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Year {veh.year} • {veh.category.toUpperCase()}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {veh.packageName ? (
                    <span className="font-medium text-slate-900">
                      {veh.packageName}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {veh.rcDocumentUrl ? (
                    <button
                      onClick={() => setActiveRcVeh(veh)}
                      className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>RC Attached</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveRcVeh(veh)}
                      className="inline-flex items-center gap-1 text-amber-700 font-semibold hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Upload RC</span>
                    </button>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {veh.inspectionPhotos ? (
                    <button
                      onClick={() => setActiveCameraVehicle(veh)}
                      className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Audit Complete</span>
                    </button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveCameraVehicle(veh)}
                      className="gap-1 text-secondary border-primary/30 hover:bg-primary/10"
                    >
                      <Camera className="h-3.5 w-3.5 text-primary" />
                      <span>Start Camera</span>
                    </Button>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <Badge
                    variant={veh.status === "verified" ? "success" : "warning"}
                  >
                    {veh.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveCameraVehicle(veh)}
                    className="text-xs text-primary font-bold"
                  >
                    Inspect
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vehicles Mobile Responsive Cards */}
      <div className="md:hidden space-y-4">
        {filteredVehicles.map((veh) => (
          <div
            key={veh.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 font-mono">
                  {veh.registrationNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {veh.make} {veh.model} ({veh.year})
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  VIN: {veh.vinOrChassis}
                </p>
              </div>
              <Badge
                variant={veh.status === "verified" ? "success" : "warning"}
              >
                {veh.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Package:</span>
              <strong className="text-slate-900">
                {veh.packageName || "None"}
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveRcVeh(veh)}
                className="w-full text-xs gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span>{veh.rcDocumentUrl ? "View RC" : "Upload RC"}</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setActiveCameraVehicle(veh)}
                className="w-full text-xs gap-1.5 font-bold"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>
                  {veh.inspectionPhotos ? "Re-Inspect" : "7-Point Audit"}
                </span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Register Vehicle Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register Vehicle for Roadside Protection"
        description="Add a customer vehicle to your dealership inventory to attach RSA packages."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onRegisterVehicle)} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Registration Plate"
              placeholder="e.g. DL01AB1234"
              {...register("registrationNumber")}
              error={errors.registrationNumber?.message}
            />
            <Input
              label="VIN / Chassis Number"
              placeholder="e.g. MALCA51HLFM876123"
              {...register("vinOrChassis")}
              error={errors.vinOrChassis?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Make"
              placeholder="e.g. Hyundai"
              {...register("make")}
              error={errors.make?.message}
            />
            <Input
              label="Model"
              placeholder="e.g. Creta"
              {...register("model")}
              error={errors.model?.message}
            />
            <Input
              label="Year"
              type="number"
              placeholder="2024"
              {...register("year", { valueAsNumber: true })}
              error={errors.year?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Vehicle Category
              </label>
              <select
                {...register("category")}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-primary"
              >
                <option value="sedan">Hatchback / Sedan</option>
                <option value="suv">SUV / MUV</option>
                <option value="luxury">Luxury / Sports</option>
                <option value="ev">Electric Vehicle (EV)</option>
                <option value="commercial">Commercial Van</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Attach Initial RSA Package
              </label>
              <select
                {...register("assignedPackageId")}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-primary"
              >
                <option value="">None (Assign later)</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title} (₹{pkg.price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRegisterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="font-bold">
              Save Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* Live Camera 7-Point Capture Modal */}
      <Modal
        isOpen={Boolean(activeCameraVehicle)}
        onClose={() => setActiveCameraVehicle(null)}
        title={`Live 7-Point Audit: ${activeCameraVehicle?.registrationNumber}`}
        description="Capture Front, Rear, Left, Right, Dashboard, Odometer, and Damage with live watermark."
        maxWidth="3xl"
      >
        {activeCameraVehicle && (
          <LiveVehicleCameraCapture
            registrationNumber={activeCameraVehicle.registrationNumber}
            onComplete={handleInspectionComplete}
            onCancel={() => setActiveCameraVehicle(null)}
          />
        )}
      </Modal>

      {/* RC Document Upload Modal */}
      <Modal
        isOpen={Boolean(activeRcVeh)}
        onClose={() => setActiveRcVeh(null)}
        title="Registration Certificate (RC) Management"
        description="Verify chassis ownership and RTO compliance."
        maxWidth="md"
      >
        {activeRcVeh && (
          <div className="space-y-4">
            <RcUpload
              vehicleId={activeRcVeh.id}
              registrationNumber={activeRcVeh.registrationNumber}
              currentRcUrl={activeRcVeh.rcDocumentUrl}
              onUploadSuccess={(url) => {
                setVehicles(
                  vehicles.map((v) =>
                    v.id === activeRcVeh.id ? { ...v, rcDocumentUrl: url } : v
                  )
                );
                setActiveRcVeh(null);
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
