// src/components/products/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

function firstImage(product: Product): string {
  const raw = product.images?.[0] ?? "";
  try {
    const parsed = JSON.parse(raw.replace(/\\"/g, '"'));
    return Array.isArray(parsed) ? parsed[0] : raw;
  } catch {
    return raw || "/placeholder.png";
  }
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: firstImage(product),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full rounded-md bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 sm:w-auto"
    >
      {added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}