// src/app/products/page.tsx
import { Suspense } from "react";
import { getProducts } from "@/services/products.service";
import { getCategories } from "@/services/categories.service";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilters";
import Pagination from "@/components/products/Pagination";

const PAGE_SIZE = 8;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    sort?: "price-asc" | "price-desc";
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const categoryId = params.categoryId ? Number(params.categoryId) : undefined;

  const products = await getProducts({
    title: params.q,
    categoryId,
    limit: 100, // fetch a working set; Platzi has no server-side sort
    offset: 0,
  });

  const sorted = [...products].sort((a, b) => {
    if (params.sort === "price-asc") return a.price - b.price;
    if (params.sort === "price-desc") return b.price - a.price;
    return 0;
  });

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">All Products</h1>

      <Suspense>
        <ProductFilters categories={categories} />
      </Suspense>

      <div className="mt-6">
        <ProductGrid products={pageItems} />
      </div>
<Suspense> 
  <Pagination currentPage={page} totalPages={totalPages} />
</Suspense>
     
    </div>
  );
}