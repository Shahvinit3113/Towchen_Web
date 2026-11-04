"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Check, AlertCircle, ShieldAlert, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title: string;
  guideText?: string;
}

export function LiveCameraModal({
  isOpen,
  onClose,
  onCapture,
  title,
  guideText,
}: LiveCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Fallback hidden file input for devices without getUserMedia
  const fallbackInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewDataUrl(null);
      setCapturedBlob(null);
      setCameraError(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const startCamera = async (mode: "environment" | "user") => {
    stopCamera();
    setCameraError(null);
    setIsStreaming(false);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Live camera is not supported on this browser. Please use a modern smartphone browser.");
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Prefer requested orientation (environment/rear)
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
        });
      } catch (errFirst) {
        // Fallback to any available camera on the device (e.g. laptop or webcam)
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.error("Video play failed:", err);
          });
          setIsStreaming(true);
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      let msg = "Could not access camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera permission was denied. Please allow camera permissions in your browser settings to capture live vehicle photos.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No camera found on this device.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        msg = "Camera is already in use by another app or tab. Please close other camera apps and retry.";
      }
      setCameraError(msg);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !isStreaming) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsCapturing(false);
        return;
      }

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);

      // Watermark with timestamp and LIVE tag to prove authenticity
      ctx.font = "bold 20px monospace";
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(15, height - 45, 340, 32);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`LIVE CAPTURE: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`, 25, height - 23);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCapturedBlob(blob);
            const dataUrl = URL.createObjectURL(blob);
            setPreviewDataUrl(dataUrl);
            stopCamera(); // Pause live stream while reviewing
          }
          setIsCapturing(false);
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      console.error("Failed to capture snapshot:", err);
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    if (previewDataUrl) {
      URL.revokeObjectURL(previewDataUrl);
    }
    setPreviewDataUrl(null);
    setCapturedBlob(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (!capturedBlob) return;
    const cleanName = title.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const file = new File(
      [capturedBlob],
      `${cleanName}_live_${Date.now()}.jpg`,
      {
        type: "image/jpeg",
        lastModified: Date.now(),
      }
    );

    onCapture(file);
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    if (previewDataUrl) {
      URL.revokeObjectURL(previewDataUrl);
    }
    setPreviewDataUrl(null);
    setCapturedBlob(null);
    onClose();
  };

  // Fallback handler if camera hardware requires native mobile camera prompt
  const handleFallbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const now = Date.now();
      // Strict gallery check: If file is older than 3 minutes, reject it
      if (file.lastModified && now - file.lastModified > 3 * 60 * 1000) {
        alert("Gallery / saved images are NOT allowed. You must capture a fresh live photo right now with your camera.");
        return;
      }
      onCapture(file);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-950 text-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] border border-slate-800">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold truncate text-white">
                {title}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                <ShieldAlert className="h-3 w-3" />
                <span>Live Camera Only • Gallery Upload Disabled</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Viewfinder / Preview / Error Body */}
        <div className="relative flex-1 bg-black aspect-4/3 sm:aspect-video flex items-center justify-center overflow-hidden min-h-[280px]">
          {/* STATE 1: Camera Error View */}
          {cameraError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950">
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/25">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h4 className="text-sm sm:text-base font-bold text-white">Camera Unavailable</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {cameraError}
                </p>
              </div>
            </div>
          ) : previewDataUrl ? (
            /* STATE 2: Captured Photo Review */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={previewDataUrl}
                alt="Captured Preview"
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                ✓ Photo Captured Live
              </div>
            </div>
          ) : (
            /* STATE 3: Live Camera Viewfinder */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Silhouette Frame */}
              <div className="absolute inset-4 sm:inset-6 pointer-events-none border-2 border-dashed border-white/50 rounded-2xl flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] text-white/70 font-mono">
                  <span>[ LIVE CAMERA ]</span>
                  <span>{facingMode === "environment" ? "REAR" : "FRONT"}</span>
                </div>
                {guideText && (
                  <div className="self-center bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1.5 rounded-full text-center max-w-xs shadow">
                    {guideText}
                  </div>
                )}
                <div className="flex justify-center text-[10px] text-white/60 font-mono">
                  Center vehicle in frame
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Fallback Input */}
        <input
          ref={fallbackInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFallbackFileChange}
        />

        {/* Bottom Controls Bar */}
        <div className="px-4 py-3.5 bg-slate-900/95 border-t border-slate-800">
          {cameraError ? (
            /* Error State: Main Action Button at Bottom */
            <div className="w-full flex flex-col gap-2.5">
              <Button
                type="button"
                size="lg"
                onClick={() => fallbackInputRef.current?.click()}
                className="w-full text-xs sm:text-sm font-bold py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" />
                <span>Open Mobile Camera App</span>
              </Button>
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => startCamera(facingMode)}
                  className="flex-1 text-xs font-semibold py-2 bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry Camera
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="flex-1 text-xs font-semibold py-2 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : previewDataUrl ? (
            /* Review Actions */
            <div className="w-full flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="flex-1 text-xs border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl py-2.5 cursor-pointer font-bold"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retake
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirm}
                className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 cursor-pointer font-bold shadow-md shadow-emerald-900/30"
              >
                <Check className="h-4 w-4 mr-1.5" /> Use This Photo
              </Button>
            </div>
          ) : (
            /* Viewfinder Shutter Actions */
            <div className="flex items-center justify-between gap-3 w-full">
              {/* Switch camera button */}
              <button
                type="button"
                onClick={switchCamera}
                disabled={!isStreaming}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                title="Switch Camera (Front / Back)"
              >
                <SwitchCamera className="h-5 w-5" />
              </button>

              {/* Shutter Button */}
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={!isStreaming || isCapturing}
                  className="relative group p-1 rounded-full border-4 border-white/80 hover:border-white transition-all cursor-pointer disabled:opacity-40"
                  title="Snap Photo"
                >
                  <div className="w-14 h-14 rounded-full bg-white group-hover:scale-95 group-active:scale-90 transition-transform shadow-lg flex items-center justify-center">
                    <Camera className="h-6 w-6 text-slate-900" />
                  </div>
                </button>
              </div>

              {/* Cancel Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

