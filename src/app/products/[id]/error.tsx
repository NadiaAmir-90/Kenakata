// src/app/products/[id]/error.tsx
"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h2 className="text-xl font-semibold">Couldn&apos;t load this product</h2>
      <button onClick={reset} className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">
        Try again
      </button>
    </div>
  );
}