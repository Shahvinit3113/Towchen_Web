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
  Camera,
  MapPin,
} from "lucide-react";

export default function DealerPackagesPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  
  const [segment, setSegment] = useState<string>("Basic");

  // Checkout modal state
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      return;
    }

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
        files: files as { front: File; rear: File; left: File; right: File; odometer: File },
        geoData: geoData || undefined,
      };

      const purchase = await packagesApi.submitDealerPackageOrder(payload);
      setSelectedPlan(null);
      setCurrentStep(1);
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


  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dealer Packages
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select a car segment, choose a package plan, and submit customer/vehicle details to instantly activate coverage.
          </p>
        </div>

        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 w-fit shrink-0">
          {["Basic", "Standard", "Premium"].map((seg) => (
            <button
              key={seg}
              onClick={() => setSegment(seg)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                segment === seg
                  ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoadingPlans ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border p-7 bg-white shadow-sm flex flex-col justify-between animate-pulse"
            >
              <div className="space-y-4">
                <div>
                  <div className="h-7 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded-lg w-1/2"></div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="h-3 bg-slate-200 rounded-lg w-1/3"></div>
                  <div className="h-8 bg-slate-200 rounded-lg w-1/2"></div>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-slate-200 shrink-0"></div>
                      <div className="h-3 bg-slate-200 rounded-lg w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100">
                <div className="h-11 bg-slate-200 rounded-xl w-full"></div>
              </div>
            </div>
          ))
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



      <Modal
        isOpen={Boolean(selectedPlan)}
        onClose={() => { setSelectedPlan(null); setCurrentStep(1); }}
        title={`Activate ${selectedPlan?.name}`}
        description={`Segment: ${segment} | Cost: ${formatCurrency(selectedPlan?.resolved_price || 0)}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleCheckout} className="pt-2 max-h-[70vh] overflow-y-auto px-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className={`flex-1 h-1.5 mx-1 rounded-full transition-colors ${currentStep >= step ? 'bg-primary' : 'bg-slate-100'}`} />
            ))}
          </div>
          
          <div className="mb-6 font-bold text-lg text-slate-800">
            {currentStep === 1 && "Step 1: Vehicle Details"}
            {currentStep === 2 && "Step 2: Customer Details"}
            {currentStep === 3 && "Step 3: Address"}
            {currentStep === 4 && "Step 4: Inspection Images"}
          </div>

          <div className="flex-1 space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <Input label="Registration Number *" value={formData.regNumber} onChange={e => setFormData({...formData, regNumber: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Make *" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} required />
                  <Input label="Model *" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Type *</label>
                    <select className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})}>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Transmission *</label>
                    <select className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={formData.transmissionType} onChange={e => setFormData({...formData, transmissionType: e.target.value})}>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Reg Year *" type="number" value={formData.registrationYear} onChange={e => setFormData({...formData, registrationYear: Number(e.target.value)})} required />
                  <Input label="Odometer *" type="number" value={formData.odometerReading} onChange={e => setFormData({...formData, odometerReading: e.target.value})} required />
                </div>
                <Input label="Chassis Number *" value={formData.chassisNumber} onChange={e => setFormData({...formData, chassisNumber: e.target.value})} required />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <Input label="Full Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <Input label="Mobile Number *" type="tel" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} required />
                <Input label="Alt Number" type="tel" value={formData.altNumber} onChange={e => setFormData({...formData, altNumber: e.target.value})} />
                <Input label="Email *" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Building" value={formData.building} onChange={e => setFormData({...formData, building: e.target.value})} />
                  <Input label="Block" value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} />
                </div>
                <Input label="Road/Street" value={formData.road} onChange={e => setFormData({...formData, road: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City *" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                  <Input label="State *" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Pincode *" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} required />
                  <Input label="GST Number" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
                </div>
              </div>
            )}

            {currentStep === 4 && (
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
            )}
          </div>

          <div className="pt-4 border-t flex justify-between gap-3 sticky bottom-0 bg-white py-2 mt-6">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => { setSelectedPlan(null); setCurrentStep(1); }}>
                Cancel
              </Button>
            )}
            
            <Button type="submit" isLoading={isProcessing}>
              {currentStep < 4 ? "Next Step" : "Confirm & Create Order"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
