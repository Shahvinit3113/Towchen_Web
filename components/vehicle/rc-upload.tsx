"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface RcUploadProps {
  vehicleId: string;
  registrationNumber: string;
  currentRcUrl?: string;
  onUploadSuccess: (url: string) => void;
}

export function RcUpload({
  vehicleId,
  registrationNumber,
  currentRcUrl,
  onUploadSuccess,
}: RcUploadProps) {
  const [rcUrl, setRcUrl] = useState<string | undefined>(currentRcUrl);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setTimeout(() => {
        setRcUrl(dataUrl);
        setIsUploading(false);
        onUploadSuccess(dataUrl);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Registration Certificate (RC) Verification
          </h4>
          <p className="text-xs text-slate-500">
            Upload clear RC copy for vehicle: <strong className="font-mono text-slate-800">{registrationNumber}</strong>
          </p>
        </div>
        {rcUrl ? (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Uploaded</span>
          </Badge>
        ) : (
          <Badge variant="warning" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Pending RC</span>
          </Badge>
        )}
      </div>

      {rcUrl ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-medium truncate max-w-[200px]">
              {fileName || `RC_${registrationNumber}.pdf`}
            </span>
          </div>
          <label className="cursor-pointer text-primary hover:text-secondary font-semibold underline">
            Replace File
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleFile}
            />
          </label>
        </div>
      ) : (
        <label className="border-2 border-dashed border-slate-300 hover:border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-primary/5">
          <UploadCloud className="h-8 w-8 text-primary mb-2" />
          <p className="text-xs font-bold text-slate-800">
            {isUploading ? "Uploading & Verifying..." : "Click or drag & drop RC Document"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            PDF, JPG, or PNG up to 10MB
          </p>
          <input
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={handleFile}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
