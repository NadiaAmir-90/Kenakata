// src/components/products/ProductGallery.tsx
"use client";

import { useState } from "react";
import SafeImage from "@/components/ui/SafeImage";

function normalizeImages(images: string[]): string[] {
  return images
    .flatMap((raw) => {
      try {
        const parsed = JSON.parse(raw.replace(/\\"/g, '"'));
        return Array.isArray(parsed) ? parsed : [raw];
      } catch {
        return [raw];
      }
    })
    .filter(Boolean);
}

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const normalized = normalizeImages(images).length ? normalizeImages(images) : [null];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <SafeImage
          src={normalized[active]}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {normalized.length > 1 && (
        <div className="mt-3 flex gap-2">
          {normalized.map((img, i) => (
            <button
              key={(img ?? "placeholder") + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-md border-2 ${
                i === active ? "border-emerald-600" : "border-transparent"
              }`}
            >
              <SafeImage src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}