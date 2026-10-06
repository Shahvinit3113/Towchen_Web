"use client";

import React, { useState, useEffect } from "react";
import { packagesApi } from "@/lib/api/packages";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  CheckCircle2,
  ArrowRight,
  Download,
  Camera,
  MapPin,
  Search,
} from "lucide-react";

export default function DealerPackagesPage() {
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  const [segment, setSegment] = useState<string>("Basic");
  const [search, setSearch] = useState("");

  // Checkout modal state
  const [selectedPlan, setSelectedPlan] = useState<Record<string, unknown> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    altNumber: "",
    email: "",
    building: "",
    block: "",
    road: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    regNumber: "",
    make: "",
    model: "",
    fuelType: "Petrol",
    transmissionType: "Manual",
    registrationYear: new Date().getFullYear(),
    chassisNumber: "",
    odometerReading: "",
  });

  // Files
  const [files, setFiles] = useState<{
    front: File | null;
    rear: File | null;
    left: File | null;
    right: File | null;
    odometer: File | null;
  }>({
    front: null,
    rear: null,
    left: null,
    right: null,
    odometer: null,
  });

  const [geoData, setGeoData] = useState<{ latitude: number | null; longitude: number | null; captured_at: string } | null>(null);
  const [isCapturingGeo, setIsCapturingGeo] = useState(false);

  useEffect(() => {
    loadPlans(segment);
  }, [segment]);

  useEffect(() => {
    loadOrders();
  }, [search]);

  async function loadPlans(seg: string) {
    setIsLoadingPlans(true);
    try {
      const data = await packagesApi.getDealerPackagePlans(seg);
      if (Array.isArray(data)) {
        setPlans(data);
      } else if (data && Array.isArray(data.data)) {
        setPlans(data.data);
      } else if (data && Array.isArray(data.items)) {
        setPlans(data.items);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setIsLoadingPlans(false);
    }
  }

  async function loadOrders() {
    setIsLoadingOrders(true);
    try {
      const data = await packagesApi.getDealerPackageOrders({ search });
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data && Array.isArray(data.data)) {
        setOrders(data.data);
      } else if (data && Array.isArray(data.items)) {
        setOrders(data.items);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }

  const captureGeoLocation = () => {
    setIsCapturingGeo(true);
    if (!navigator.geolocation) {
      setGeoData({ latitude: null, longitude: null, captured_at: new Date().toISOString() });
      setIsCapturingGeo(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          captured_at: new Date().toISOString(),
        });
        setIsCapturingGeo(false);
      },
      () => {
        setGeoData({ latitude: null, longitude: null, captured_at: new Date().toISOString() });
        setIsCapturingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [key]: e.target.files![0] }));
      if (!geoData) captureGeoLocation(); // Capture once when an image is selected
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!files.front || !files.rear || !files.left || !files.right || !files.odometer) {
      alert("Please upload all 5 inspection images.");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        customerData: { ...formData },
        vehicleData: { ...formData, odometerReading: Number(formData.odometerReading), carSegment: segment },
        packageData: {
          planId: selectedPlan.id,
          startDate: new Date().toISOString().split('T')[0],
        },
        files: files as unknown as Record<string, File>,
        geoData: geoData || undefined,
      };

      const purchase = await packagesApi.submitDealerPackageOrder(payload);
      setSelectedPlan(null);
      loadOrders();
      alert(`Package successfully activated! Order Number: ${purchase?.order_number}`);
      
      if (purchase?.package_pdf_url) {
        window.open(purchase.package_pdf_url, '_blank');
      }
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to process package purchase.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const url = await packagesApi.getCertificateDownloadUrl(id);
      if (url) {
        window.open(url, '_blank');
      } else {
        alert("Download URL not found");
      }
    } catch (err) {
      alert("Failed to download certificate.");
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Dealer Packages
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select a car segment, choose a package plan, and submit customer/vehicle details to instantly activate coverage.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Select Car Segment</h2>
        <div className="flex gap-4">
          {["Basic", "Standard", "Premium"].map((seg) => (
            <button
              key={seg}
              onClick={() => setSegment(seg)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                segment === seg
                  ? "bg-primary text-white shadow-md ring-2 ring-primary/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoadingPlans ? (
          <p className="text-slate-500">Loading plans...</p>
        ) : plans.length === 0 ? (
          <p className="text-slate-500">No active plans found for {segment} segment.</p>
        ) : (
          plans.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-3xl border p-7 bg-white shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{pkg.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {pkg.plan_period_months} Months Cover
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Your Cost ({pkg.selected_segment})
                  </span>
                  <div className="text-2xl font-black text-slate-900">
                    {formatCurrency(pkg.resolved_price)}
                  </div>
                </div>

                <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Incidents: {pkg.incidents}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Distance: {pkg.distance_km} km</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Hotel: {pkg.hotel_accommodation} stays</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Cab: {pkg.cab_service} rides</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Button
                  onClick={() => setSelectedPlan(pkg)}
                  size="lg"
                  className="w-full font-bold bg-primary hover:bg-secondary"
                >
                  <span>Select & Fill Details</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Package History</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary w-64"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle Plate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingOrders ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.order_number}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{order.plan_name}</td>
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block">{order.customer?.customer_name}</strong>
                      <span className="text-slate-500 text-[11px] font-mono">{order.customer?.customer_number}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {order.vehicle?.vehicle_reg_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success">{order.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(order.id)}>
                        <Download className="h-4 w-4 mr-1.5" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedPlan)}
        onClose={() => setSelectedPlan(null)}
        title={`Activate ${selectedPlan?.name}`}
        description={`Segment: ${segment} | Cost: ${formatCurrency(selectedPlan?.resolved_price || 0)}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleCheckout} className="space-y-6 pt-2 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b pb-2">Customer Details</h3>
              <Input label="Full Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label="Mobile Number *" type="tel" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} required />
              <Input label="Alt Number" type="tel" value={formData.altNumber} onChange={e => setFormData({...formData, altNumber: e.target.value})} />
              <Input label="Email *" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Building" value={formData.building} onChange={e => setFormData({...formData, building: e.target.value})} />
                <Input label="Block" value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} />
              </div>
              <Input label="Road/Street" value={formData.road} onChange={e => setFormData({...formData, road: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="City *" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                <Input label="State *" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Pincode *" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} required />
                <Input label="GST Number" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b pb-2">Vehicle Details</h3>
              <Input label="Registration Number *" value={formData.regNumber} onChange={e => setFormData({...formData, regNumber: e.target.value})} required />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Make *" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} required />
                <Input label="Model *" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Type *</label>
                  <select className="w-full h-11 rounded-xl border px-3 text-sm" value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})}>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transmission *</label>
                  <select className="w-full h-11 rounded-xl border px-3 text-sm" value={formData.transmissionType} onChange={e => setFormData({...formData, transmissionType: e.target.value})}>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Reg Year *" type="number" value={formData.registrationYear} onChange={e => setFormData({...formData, registrationYear: Number(e.target.value)})} required />
                <Input label="Odometer *" type="number" value={formData.odometerReading} onChange={e => setFormData({...formData, odometerReading: e.target.value})} required />
              </div>
              <Input label="Chassis Number *" value={formData.chassisNumber} onChange={e => setFormData({...formData, chassisNumber: e.target.value})} required />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900">Inspection Images</h3>
              {geoData ? (
                <Badge variant="success" className="text-[10px]">
                  <MapPin className="h-3 w-3 mr-1" /> Geo-tagged
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] text-slate-500">
                  <MapPin className="h-3 w-3 mr-1" /> Awaiting Image
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { key: 'front', label: 'Front View' },
                { key: 'rear', label: 'Rear View' },
                { key: 'left', label: 'Left Side' },
                { key: 'right', label: 'Right Side' },
                { key: 'odometer', label: 'Dashboard/Odometer' },
              ].map((img) => (
                <div key={img.key} className="relative">
                  <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${files[img.key as keyof typeof files] ? 'border-primary bg-primary/5' : 'border-slate-300'}`}>
                    <Camera className={`h-6 w-6 mb-2 ${files[img.key as keyof typeof files] ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-bold text-center px-2">{img.label}</span>
                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, img.key as keyof typeof files)} />
                  </label>
                  {files[img.key as keyof typeof files] && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white py-2">
            <Button type="button" variant="outline" onClick={() => setSelectedPlan(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isProcessing}>
              Confirm & Create Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
