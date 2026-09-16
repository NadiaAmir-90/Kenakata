// src/components/products/ProductGrid.tsx
import { Product } from "@/types";
import ProductCard from "./ProductCard";
import ExpandableGrid from "@/components/ui/ExpandableGrid";

export default function ProductGrid({
  products,
}: {
  products: Product[];
}) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-gray-500">
        No products found.
      </p>
    );
  }

  return (
    <ExpandableGrid
      mobileInitialCount={4}
      gridClassName="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ExpandableGrid>
  );
}