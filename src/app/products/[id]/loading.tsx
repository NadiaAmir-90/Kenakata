// src/app/products/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-lg bg-gray-200" />
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}