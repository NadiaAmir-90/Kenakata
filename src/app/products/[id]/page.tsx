// src/app/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { getProductById, getProducts } from "@/services/products.service";
import ProductGallery from "@/components/products/ProductGallery";
import AddToCartButton from "@/components/products/AddToCartButton";
import ProductGrid from "@/components/products/ProductGrid";
import { ApiError } from "@/services/api";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts({ limit: 20 });
  return products.map((p) => ({ id: String(p.id) }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// This API sometimes returns 400 (not 404) with an "EntityNotFoundError"
// message for a missing product — likely because the underlying store is
// public/write-anyone and products can be deleted between when
// generateStaticParams lists them and when this page actually fetches one.
// Treat both shapes as "not found" so a single vanished product can't crash
// the entire build.
function isNotFoundError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.status === 404) return true;
  if (err.status === 400 && /EntityNotFoundError|not found/i.test(err.message)) return true;
  return false;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  let product;
  try {
    product = await getProductById(id);
  } catch (err) {
    if (isNotFoundError(err)) notFound();
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