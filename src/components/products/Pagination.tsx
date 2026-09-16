// src/components/products/Pagination.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex justify-center gap-2">
      <button
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
        className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
      >
        Prev
      </button>
      <span className="px-3 py-1 text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => goTo(currentPage + 1)}
        className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}