import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CldImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: any;
  width?: number;
  height?: number;
  transformation?: "avatar" | "thumbnail" | "cover" | "banner";
  lowQuality?: boolean;
}

/**
 * 🔹 Unified Image Component for Frontend (Vite/React)
 * Handles Cloudinary URLs, local imports, and prevents layout shifting.
 */
export const CldImage: React.FC<CldImageProps> = ({
  src,
  width,
  height,
  transformation,
  lowQuality = false,
  className,
  alt = "Image",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // If src is an object from Cloudinary (new format)
  const imageUrl = typeof src === "object" && src?.url ? src.url : src;

  // Construct Cloudinary transformation URL if applicable
  const getTransformedUrl = (url: string) => {
    if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) return url;

    const parts = url.split("/upload/");
    if (parts.length !== 2) return url;

    let transform = "f_auto,q_auto";
    
    if (transformation === "avatar") {
      transform += ",w_150,h_150,c_fill,g_face,r_max";
    } else if (transformation === "thumbnail") {
      transform += ",w_300,h_300,c_fill";
    } else if (transformation === "cover") {
      transform += ",w_800,h_450,c_fill";
    } else if (transformation === "banner") {
      transform += ",w_1600,h_900,c_fill";
    }

    if (lowQuality) {
      transform += ",e_blur:1000,q_10";
    }

    return `${parts[0]}/upload/${transform}/${parts[1]}`;
  };

  const finalSrc = getTransformedUrl(imageUrl);

  return (
    <div 
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        !isLoaded && "bg-muted animate-pulse",
        className
      )}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
      }}
    >
       {/* High Quality Image */}
      <img
        src={finalSrc}
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        decoding="async"
        {...props}
      />

      {/* Fallback for error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs text-center p-2">
          Image not found
        </div>
      )}
    </div>
  );
};
