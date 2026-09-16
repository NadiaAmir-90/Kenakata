// src/app/products/error.tsx
"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h2 className="text-xl font-semibold">Something went wrong loading products</h2>
      <p className="mt-2 text-sm text-gray-500">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">
        Try again
      </button>
    </div>
  );
}