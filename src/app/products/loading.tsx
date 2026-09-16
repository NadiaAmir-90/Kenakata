// src/app/products/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}