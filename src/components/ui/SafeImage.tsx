// src/components/ui/SafeImage.tsx
"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { getSafeImageUrl } from "@/lib/safe-image";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string | null | undefined;
};

const FALLBACK = "/placeholder.png";

export default function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(() => getSafeImageUrl(src));

  // If the parent re-renders with a different `src` (e.g. gallery thumbnail click),
  // re-validate rather than getting stuck on a stale fallback.
  useEffect(() => {
    setImgSrc(getSafeImageUrl(src));
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(FALLBACK)} // catches allowlisted-but-dead hosts (e.g. placeimg.com)
    />
  );
}