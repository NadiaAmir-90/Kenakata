// src/components/products/ProductCard.tsx
import Link from "next/link";
import { Product } from "@/types";
import SafeImage from "@/components/ui/SafeImage";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <SafeImage
          src={product.images?.[0]}
          alt={product.title}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <h3 className="mt-2 line-clamp-1 text-sm font-medium">{product.title}</h3>
      <p className="text-sm text-gray-600">${product.price}</p>
    </Link>
  );
}