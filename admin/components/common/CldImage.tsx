"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CldTransformation = "thumbnail" | "card" | "modal" | "full" | "avatar";

interface CldImageProps extends Omit<ImageProps, "src"> {
  src: string | { url: string; publicId?: string; version?: string } | null | undefined;
  transformation?: CldTransformation;
  fallback?: string;
}

/**
 * Unified Cloudinary Image Component
 * Handles transformations, fallbacks, and loading states.
 */
export const CldImage: React.FC<CldImageProps> = ({
  src,
  transformation = "card",
  fallback = "/placeholder.png",
  className,
  alt,
  ...props
}) => {
  const [error, setError] = useState(false);

  // Parse source
  let url = "";
  let publicId = "";

  if (!src) {
    url = fallback;
  } else if (typeof src === "string") {
    url = src;
    // Try to extract publicId if it's a Cloudinary URL
    if (src.includes("res.cloudinary.com")) {
      const parts = src.split("/");
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex !== -1) {
          // Public ID is usually everything after version/ (if present) or upload/
          const afterUpload = parts.slice(uploadIndex + 1);
          // if first part starts with 'v' followed by numbers, it's a version
          if (afterUpload[0].match(/^v\d+$/)) {
              publicId = afterUpload.slice(1).join("/");
          } else {
              publicId = afterUpload.join("/");
          }
          // strip extension
          publicId = publicId.replace(/\.[^/.]+$/, "");
      }
    }
  } else {
    url = src.url;
    publicId = src.publicId || "";
  }

  // Construct Cloudinary transformation URL if we have a publicId
  let finalSrc = url;
  if (publicId && url.includes("res.cloudinary.com")) {
    const cloudName = url.split("/")[3];
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
    
    let transformQuery = "f_auto,q_auto";
    
    switch (transformation) {
      case "thumbnail":
        transformQuery += ",w_150,h_150,c_fill,g_center";
        break;
      case "avatar":
        transformQuery += ",w_100,h_100,c_fill,g_face,r_max";
        break;
      case "card":
        transformQuery += ",w_600,c_limit";
        break;
      case "modal":
        transformQuery += ",w_1200,c_limit";
        break;
      case "full":
        // Keep auto format/quality only
        break;
    }

    finalSrc = `${baseUrl}/${transformQuery}/${src && typeof src === 'object' && src.version ? src.version + '/' : ''}${publicId}`;
  }

  if (error || !finalSrc) {
    finalSrc = fallback;
  }

  const isFill = !props.width && !props.height;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={finalSrc}
        alt={alt || "Image"}
        onError={() => setError(true)}
        loading="lazy"
        fill={isFill}
        className={cn(isFill && "object-cover")}
        {...props}
      />
    </div>
  );
};
