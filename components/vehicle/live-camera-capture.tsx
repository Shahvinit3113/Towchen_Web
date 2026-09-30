"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { VehicleInspectionPhotos } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CheckCircle2,
  RotateCcw,
  Upload,
  AlertCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  VideoOff,
} from "lucide-react";

export type InspectionAngle =
  | "front"
  | "rear"
  | "left"
  | "right"
  | "dashboard"
  | "odometer"
  | "damage";

interface AngleMeta {
  key: InspectionAngle;
  title: string;
  guideline: string;
  required: boolean;
}

const INSPECTION_ANGLES: AngleMeta[] = [
  {
    key: "front",
    title: "1. Front View",
    guideline: "Capture full front bumper, hood, and registration plate.",
    required: true,
  },
  {
    key: "rear",
    title: "2. Rear View",
    guideline: "Capture complete rear trunk, taillights, and plate.",
    required: true,
  },
  {
    key: "left",
    title: "3. Left Profile",
    guideline: "Capture full driver side doors, quarter panels, and wheels.",
    required: true,
  },
  {
    key: "right",
    title: "4. Right Profile",
    guideline: "Capture passenger side doors, quarter panels, and fuel flap.",
    required: true,
  },
  {
    key: "dashboard",
    title: "5. Dashboard Cluster",
    guideline: "Capture ignition ON with dashboard warning lights visible.",
    required: true,
  },
  {
    key: "odometer",
    title: "6. Odometer Reading",
    guideline: "Clear close-up view of total kilometers driven.",
    required: true,
  },
  {
    key: "damage",
    title: "7. Damage / Scratches",
    guideline: "Close-up of any existing dents, scratches, or broken glass.",
    required: false,
  },
];

interface LiveCameraCaptureProps {
  registrationNumber?: string;
  onComplete: (photos: VehicleInspectionPhotos) => void;
  onCancel: () => void;
}

export function LiveVehicleCameraCapture({
  registrationNumber = "PENDING_REG",
  onComplete,
  onCancel,
}: LiveCameraCaptureProps) {
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<
    Partial<Record<InspectionAngle, string>>
  >({});
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentAngle = INSPECTION_ANGLES[currentAngleIndex];
  const totalRequired = INSPECTION_ANGLES.filter((a) => a.required).length;
  const capturedCount = Object.keys(capturedPhotos).length;
  const progressPercent = Math.round(
    (capturedCount / INSPECTION_ANGLES.length) * 100
  );

  // Initialize camera only when opened
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported on this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError(
        "Could not access live camera. You can upload an image file instead or allow camera permissions in your browser."
      );
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Capture snapshot and watermark with timestamp and angle
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Watermark overlay
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
    });

    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.fillRect(0, canvas.height - 48, canvas.width, 48);

    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(
      `TowChain Live Audit | ${registrationNumber} | ${currentAngle.title.toUpperCase()}`,
      16,
      canvas.height - 24
    );

    ctx.fillStyle = "#f8fafc";
    ctx.font = "14px monospace";
    ctx.fillText(formattedDate, canvas.width - 240, canvas.height - 24);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    setCapturedPhotos((prev) => ({
      ...prev,
      [currentAngle.key]: dataUrl,
    }));

    // Auto advance to next angle if available
    if (currentAngleIndex < INSPECTION_ANGLES.length - 1) {
      setCurrentAngleIndex((prev) => prev + 1);
    }
  };

  // Fallback file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedPhotos((prev) => ({
        ...prev,
        [currentAngle.key]: result,
      }));
      if (currentAngleIndex < INSPECTION_ANGLES.length - 1) {
        setCurrentAngleIndex((prev) => prev + 1);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = (key: InspectionAngle) => {
    setCapturedPhotos((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    const targetIdx = INSPECTION_ANGLES.findIndex((a) => a.key === key);
    if (targetIdx !== -1) {
      setCurrentAngleIndex(targetIdx);
    }
  };

  const finalizeAudit = () => {
    setIsProcessing(true);
    const result: VehicleInspectionPhotos = {
      front: capturedPhotos.front,
      rear: capturedPhotos.rear,
      left: capturedPhotos.left,
      right: capturedPhotos.right,
      dashboard: capturedPhotos.dashboard,
      odometer: capturedPhotos.odometer,
      damage: capturedPhotos.damage,
      capturedAt: new Date().toISOString(),
    };
    stopCamera();
    onComplete(result);
  };

  const hasCurrentPhoto = Boolean(capturedPhotos[currentAngle.key]);

  return (
    <div className="w-full space-y-5">
      {/* Progress & Angle Indicators */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-700">
            Inspection Step {currentAngleIndex + 1} of {INSPECTION_ANGLES.length}
          </span>
          <span className="font-mono font-bold text-primary">
            {capturedCount} of {INSPECTION_ANGLES.length} Captured ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Angle Step Buttons */}
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {INSPECTION_ANGLES.map((angle, idx) => {
            const isCaptured = Boolean(capturedPhotos[angle.key]);
            const isCurrent = idx === currentAngleIndex;
            return (
              <button
                key={angle.key}
                type="button"
                onClick={() => setCurrentAngleIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? "bg-primary text-white shadow-xs font-bold"
                    : isCaptured
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isCaptured && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                <span>{angle.title.replace(/^\d+\.\s*/, "")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Angle Directive Card */}
      <div className="p-3.5 bg-primary/5 border border-primary/30 rounded-xl flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {currentAngle.title}
          </h4>
          <p className="text-xs text-secondary mt-0.5">{currentAngle.guideline}</p>
        </div>
        {currentAngle.required ? (
          <Badge variant="primary">Required</Badge>
        ) : (
          <Badge variant="secondary">Optional</Badge>
        )}
      </div>

      {/* Camera Live Viewfinder / Capture Box */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
        {hasCurrentPhoto ? (
          // Captured Snapshot Preview
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedPhotos[currentAngle.key]}
              alt={currentAngle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Badge variant="success">Saved & Watermarked</Badge>
              <button
                onClick={() => handleRetake(currentAngle.key)}
                className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retake</span>
              </button>
            </div>
          </div>
        ) : cameraActive ? (
          // Live Video Stream
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder Target Reticle */}
            <div className="absolute inset-8 border-2 border-dashed border-primary/50 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="bg-slate-900/70 text-blue-100 text-xs px-3 py-1 rounded-full font-mono">
                Align {currentAngle.title.replace(/^\d+\.\s*/, "")}
              </span>
            </div>
          </div>
        ) : (
          // Camera Inactive / Permission Prompt
          <div className="text-center p-6 space-y-3 text-slate-300">
            <VideoOff className="h-10 w-10 mx-auto text-slate-500" />
            <p className="text-sm font-medium">Camera is offline or permission needed</p>
            {cameraError && (
              <p className="text-xs text-red-400 max-w-sm mx-auto">{cameraError}</p>
            )}
            <div className="flex items-center justify-center gap-2.5">
              <Button size="sm" onClick={startCamera}>
                Enable Camera
              </Button>
              <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700">
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload Photo File
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Capture Actions Bar */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel Inspection
        </Button>

        <div className="flex items-center gap-2">
          {!hasCurrentPhoto && cameraActive && (
            <Button
              onClick={capturePhoto}
              className="font-bold bg-primary hover:bg-secondary gap-2 px-6"
            >
              <Camera className="h-4 w-4" />
              <span>Capture {currentAngle.title.replace(/^\d+\.\s*/, "")}</span>
            </Button>
          )}

          {capturedCount >= totalRequired && (
            <Button
              onClick={finalizeAudit}
              isLoading={isProcessing}
              className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Save & Complete Inspection</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
