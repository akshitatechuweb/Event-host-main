"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SecureImageUploadProps {
  onSuccess: (data: { publicId: string; url: string; version: string }) => void;
  folder: string;
  publicId?: string;
  label?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  previewUrl?: string;
  children?: React.ReactNode;
}

/**
 * Secure Image Upload Component using Signed Uploads.
 */
export const SecureImageUpload: React.FC<SecureImageUploadProps> = ({
  onSuccess,
  folder,
  publicId,
  label = "Upload Image",
  className,
  aspectRatio = "square",
  previewUrl,
  children,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Set local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setLocalPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      setProgress(0);

      // 1. Get signed signature from backend
      const { data: sigData } = await axios.post("/api/upload/signature", {
        folder,
        publicId,
      });

      if (!sigData.success) {
        throw new Error(sigData.message || "Failed to get upload signature");
      }

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp.toString());
      formData.append("signature", sigData.signature);
      formData.append("folder", sigData.folder);
      if (sigData.publicId) formData.append("public_id", sigData.publicId);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;

      const uploadRes = await axios.post(cloudinaryUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          setProgress(percentCompleted);
        },
      });

      const { public_id, secure_url, version } = uploadRes.data;

      // 3. Callback to parent with metadata
      onSuccess({
        publicId: public_id,
        url: secure_url,
        version: `v${version}`,
      });

      toast.success("Upload successful!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || err.message || "Upload failed");
      setLocalPreview(previewUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-auto",
  }[aspectRatio];

  return (
    <div className={className}>
      {label && <label className="text-sm font-medium mb-2 block">{label}</label>}
      <div
        className={children ? "" : `relative border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden bg-muted/5 group hover:border-primary/50 transition-colors ${aspectClass}`}
        onClick={children ? () => fileInputRef.current?.click() : undefined}
      >
        {children ? (
          children
        ) : localPreview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={localPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!uploading && (
              <button
                type="button"
                onClick={() => {
                  setLocalPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-destructive hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
            <span className="text-xs text-muted-foreground">Click to upload</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center backdrop-blur-sm z-10 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <div className="w-2/3 bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] mt-1 font-medium">{progress}%</span>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

