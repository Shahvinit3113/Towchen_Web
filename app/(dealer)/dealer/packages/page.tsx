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
  Shield,
  Clock,
  Car,
  Hotel,
  Navigation,
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

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.regNumber.trim()) newErrors.regNumber = "Registration number is required";
      else if (formData.regNumber.trim().length < 4) newErrors.regNumber = "Enter a valid registration number";
      if (!formData.make.trim()) newErrors.make = "Vehicle make is required";
      if (!formData.model.trim()) newErrors.model = "Vehicle model is required";
      if (!formData.odometerReading) newErrors.odometerReading = "Odometer reading is required";
      if (!formData.chassisNumber.trim()) newErrors.chassisNumber = "Chassis number is required";
      else if (formData.chassisNumber.trim().length < 5) newErrors.chassisNumber = "Enter a valid chassis number";
      if (formData.registrationYear < 1990 || formData.registrationYear > new Date().getFullYear() + 1) {
        newErrors.registrationYear = "Enter a valid year";
      }
    }

    if (step === 2) {
      if (!formData.name.trim()) newErrors.name = "Customer name is required";
      if (!formData.number.trim()) newErrors.number = "Mobile number is required";
      else if (!/^\d{10}$/.test(formData.number.trim())) newErrors.number = "Enter a valid 10-digit mobile number";
      if (formData.altNumber && !/^\d{10}$/.test(formData.altNumber.trim())) newErrors.altNumber = "Enter a valid 10-digit number";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = "Enter a valid email address";
    }

    if (step === 3) {
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
      else if (!/^\d{6}$/.test(formData.pincode.trim())) newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    if (step === 4) {
      if (!files.front) newErrors.front = "Required";
      if (!files.rear) newErrors.rear = "Required";
      if (!files.left) newErrors.left = "Required";
      if (!files.right) newErrors.right = "Required";
      if (!files.odometer) newErrors.odometer = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!validateStep(currentStep)) return;

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
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
      setErrors({});
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
            Choose from our roadside assistance plans and activate coverage for your customers.
          </p>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto">
        {["Basic", "Standard", "Premium"].map(seg => (
          <button
            key={seg}
            onClick={() => setSegment(seg)}
            className={`flex-1 sm:flex-initial text-center px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              segment === seg ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {seg}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      {isLoadingPlans ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></div>
          <span className="text-sm font-medium">Loading plans...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-semibold">No plans available for this segment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="group relative rounded-2xl border border-slate-200 hover:border-primary/40 bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 overflow-hidden">
              {/* Top Accent */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-indigo-500" />

              <div className="p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {plan.plan_period_months ? `${plan.plan_period_months} Months` : "12 Months"} Coverage
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{segment}</Badge>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-3xl font-black text-slate-900">{formatCurrency(plan.resolved_price || plan.base_price || 0)}</span>
                  {plan.base_price && plan.resolved_price && plan.base_price !== plan.resolved_price && (
                    <span className="text-sm text-slate-400 line-through ml-2">{formatCurrency(plan.base_price)}</span>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">One-time payment</p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
                    <Car className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{plan.incidents || "Unlimited"}</p>
                      <p className="text-[10px] text-slate-500">Incidents</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
                    <Navigation className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{plan.distance_km ? `${plan.distance_km} km` : "50 km"}</p>
                      <p className="text-[10px] text-slate-500">Tow Distance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
                    <Hotel className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{plan.hotel_accommodation || 0} Nights</p>
                      <p className="text-[10px] text-slate-500">Hotel Stay</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{plan.cab_service || 0} Rides</p>
                      <p className="text-[10px] text-slate-500">Cab Service</p>
                    </div>
                  </div>
                </div>

                {/* Extra Features List */}
                {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <Button className="w-full font-bold gap-2 h-11 group-hover:bg-secondary transition-colors" onClick={() => { setSelectedPlan(plan); setCurrentStep(1); setErrors({}); }}>
                  Activate Plan <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* ── Checkout Modal ── */}
      <Modal
        isOpen={Boolean(selectedPlan)}
        onClose={() => { setSelectedPlan(null); setCurrentStep(1); setErrors({}); }}
        title={`Activate ${selectedPlan?.name}`}
        description={`Segment: ${segment} | Cost: ${formatCurrency(selectedPlan?.resolved_price || 0)}`}
        maxWidth="4xl"
      >
        <form onSubmit={handleCheckout} className="pt-2 max-h-[78vh] overflow-y-auto px-1 flex flex-col">
          {/* Progress Bar with Labels */}
          <div className="flex items-center gap-2 mb-6">
            {[
              { step: 1, label: "Vehicle" },
              { step: 2, label: "Customer" },
              { step: 3, label: "Address" },
              { step: 4, label: "Images" },
            ].map(({ step, label }) => (
              <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-full h-2 rounded-full transition-all duration-300 ${currentStep >= step ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-slate-100'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= step ? 'text-primary' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Step Header */}
          <div className="mb-8 pb-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {currentStep === 1 && "Vehicle Details"}
              {currentStep === 2 && "Customer Details"}
              {currentStep === 3 && "Address Details"}
              {currentStep === 4 && "Inspection Images"}
            </h2>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
              Step {currentStep} of 4
            </div>
          </div>

          <div className="flex-1 space-y-5">
            {/* ── Step 1: Vehicle Details ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <Input
                  label="Registration Number *"
                  placeholder="e.g. MH01AB1234"
                  value={formData.regNumber}
                  onChange={e => { setFormData({...formData, regNumber: e.target.value.toUpperCase()}); if (errors.regNumber) setErrors(prev => ({...prev, regNumber: ''})); }}
                  error={errors.regNumber}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Make *"
                    placeholder="e.g. Maruti Suzuki, Hyundai"
                    value={formData.make}
                    onChange={e => { setFormData({...formData, make: e.target.value}); if (errors.make) setErrors(prev => ({...prev, make: ''})); }}
                    error={errors.make}
                  />
                  <Input
                    label="Model *"
                    placeholder="e.g. Swift, Creta, i20"
                    value={formData.model}
                    onChange={e => { setFormData({...formData, model: e.target.value}); if (errors.model) setErrors(prev => ({...prev, model: ''})); }}
                    error={errors.model}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="w-full space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Fuel Type *</label>
                    <select
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.fuelType}
                      onChange={e => setFormData({...formData, fuelType: e.target.value})}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div className="w-full space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Transmission *</label>
                    <select
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.transmissionType}
                      onChange={e => setFormData({...formData, transmissionType: e.target.value})}
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Registration Year *"
                    placeholder="e.g. 2024"
                    type="number"
                    value={formData.registrationYear}
                    onChange={e => { setFormData({...formData, registrationYear: Number(e.target.value)}); if (errors.registrationYear) setErrors(prev => ({...prev, registrationYear: ''})); }}
                    error={errors.registrationYear}
                  />
                  <Input
                    label="Odometer Reading (km) *"
                    placeholder="e.g. 25000"
                    type="number"
                    value={formData.odometerReading}
                    onChange={e => { setFormData({...formData, odometerReading: e.target.value}); if (errors.odometerReading) setErrors(prev => ({...prev, odometerReading: ''})); }}
                    error={errors.odometerReading}
                  />
                </div>
                <Input
                  label="Chassis Number *"
                  placeholder="e.g. MA3FJEB1S00123456"
                  value={formData.chassisNumber}
                  onChange={e => { setFormData({...formData, chassisNumber: e.target.value.toUpperCase()}); if (errors.chassisNumber) setErrors(prev => ({...prev, chassisNumber: ''})); }}
                  error={errors.chassisNumber}
                />
              </div>
            )}

            {/* ── Step 2: Customer Details ── */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.name}
                  onChange={e => { setFormData({...formData, name: e.target.value}); if (errors.name) setErrors(prev => ({...prev, name: ''})); }}
                  error={errors.name}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Mobile Number *"
                    placeholder="e.g. 9876543210"
                    type="tel"
                    maxLength={10}
                    value={formData.number}
                    onChange={e => { setFormData({...formData, number: e.target.value.replace(/\D/g, '')}); if (errors.number) setErrors(prev => ({...prev, number: ''})); }}
                    error={errors.number}
                  />
                  <Input
                    label="Alternate Number"
                    placeholder="e.g. 9123456780 (optional)"
                    type="tel"
                    maxLength={10}
                    value={formData.altNumber}
                    onChange={e => { setFormData({...formData, altNumber: e.target.value.replace(/\D/g, '')}); if (errors.altNumber) setErrors(prev => ({...prev, altNumber: ''})); }}
                    error={errors.altNumber}
                  />
                </div>
                <Input
                  label="Email Address *"
                  placeholder="e.g. customer@email.com"
                  type="email"
                  value={formData.email}
                  onChange={e => { setFormData({...formData, email: e.target.value}); if (errors.email) setErrors(prev => ({...prev, email: ''})); }}
                  error={errors.email}
                />
              </div>
            )}

            {/* ── Step 3: Address ── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Building / Society"
                    placeholder="e.g. Tower B, Prestige Lakeside"
                    value={formData.building}
                    onChange={e => setFormData({...formData, building: e.target.value})}
                  />
                  <Input
                    label="Block / Wing"
                    placeholder="e.g. Wing A, Block 3"
                    value={formData.block}
                    onChange={e => setFormData({...formData, block: e.target.value})}
                  />
                </div>
                <Input
                  label="Road / Street"
                  placeholder="e.g. MG Road, Sector 17"
                  value={formData.road}
                  onChange={e => setFormData({...formData, road: e.target.value})}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Input
                    label="City *"
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={e => { setFormData({...formData, city: e.target.value}); if (errors.city) setErrors(prev => ({...prev, city: ''})); }}
                    error={errors.city}
                  />
                  <Input
                    label="State *"
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={e => { setFormData({...formData, state: e.target.value}); if (errors.state) setErrors(prev => ({...prev, state: ''})); }}
                    error={errors.state}
                  />
                  <Input
                    label="Pincode *"
                    placeholder="e.g. 400001"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={e => { setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')}); if (errors.pincode) setErrors(prev => ({...prev, pincode: ''})); }}
                    error={errors.pincode}
                  />
                </div>
                <Input
                  label="GST Number"
                  placeholder="e.g. 27AABCT1234F1ZH (optional)"
                  value={formData.gstNumber}
                  onChange={e => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
                />
              </div>
            )}

            {/* ── Step 4: Inspection Images ── */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900">Upload Vehicle Photos</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Take clear photos of the vehicle from all angles</p>
                  </div>
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

                {Object.keys(errors).some(k => ['front','rear','left','right','odometer'].includes(k)) && (
                  <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
                    Please upload all 5 inspection photos before submitting.
                  </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { key: 'front', label: 'Front View' },
                    { key: 'rear', label: 'Rear View' },
                    { key: 'left', label: 'Left Side' },
                    { key: 'right', label: 'Right Side' },
                    { key: 'odometer', label: 'Odometer' },
                  ].map((img) => (
                    <div key={img.key} className="relative">
                      <label className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        files[img.key as keyof typeof files]
                          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                          : errors[img.key]
                            ? 'border-red-400 bg-red-50/50 hover:bg-red-50'
                            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                      }`}>
                        <Camera className={`h-7 w-7 mb-2 ${
                          files[img.key as keyof typeof files] ? 'text-primary' : errors[img.key] ? 'text-red-400' : 'text-slate-400'
                        }`} />
                        <span className={`text-[11px] font-bold text-center px-2 ${errors[img.key] ? 'text-red-500' : ''}`}>{img.label}</span>
                        <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => { handleFileChange(e, img.key as keyof typeof files); if (errors[img.key]) setErrors(prev => ({...prev, [img.key]: ''})); }} />
                      </label>
                      {files[img.key as keyof typeof files] && (
                        <div className="absolute top-1.5 right-1.5">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-white rounded-full shadow-sm" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-5 border-t border-slate-100 flex justify-between gap-3 sticky -bottom-1 bg-white py-4 mt-8 z-10">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" className="font-bold w-36 border-slate-200 hover:bg-slate-50" onClick={() => { setCurrentStep(prev => prev - 1); setErrors({}); }}>
                &#8592; Back
              </Button>
            ) : (
              <Button type="button" variant="outline" className="font-bold w-36 border-slate-200 hover:bg-slate-50" onClick={() => { setSelectedPlan(null); setCurrentStep(1); setErrors({}); }}>
                Cancel
              </Button>
            )}
            
            <Button type="submit" isLoading={isProcessing} className="font-bold w-52 shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-secondary text-white">
              {currentStep < 4 ? "Next Step \u2192" : "Create Order"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
