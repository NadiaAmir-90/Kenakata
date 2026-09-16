// src/app/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { getProductById, getProducts } from "@/services/products.service";
import ProductGallery from "@/components/products/ProductGallery";
import AddToCartButton from "@/components/products/AddToCartButton";
import ProductGrid from "@/components/products/ProductGrid";
import { ApiError } from "@/services/api";

export const revalidate = 60; // ISR fallback for products not pre-built

export async function generateStaticParams() {
  // Pre-build the first 20 products at build time; the rest fall back to ISR
  const products = await getProducts({ limit: 20 });
  return products.map((p) => ({ id: String(p.id) }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  let product;
  try {
    product = await getProductById(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const related = await getProducts({ categoryId: product.category.id, limit: 4 });
  const relatedFiltered = related.filter((p) => p.id !== product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          <p className="text-sm uppercase text-gray-500">{product.category.name}</p>
          <h1 className="mt-1 text-3xl font-semibold">{product.title}</h1>
          <p className="mt-4 text-2xl font-bold text-emerald-600">${product.price}</p>
          <p className="mt-6 text-gray-700">{product.description}</p>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {relatedFiltered.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">Related Products</h2>
          <ProductGrid products={relatedFiltered} />
        </section>
      )}
    </div>
  );
}