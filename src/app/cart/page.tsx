// src/app/cart/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"; // add
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext"; // add
import SafeImage from "@/components/ui/SafeImage";
import toast from "react-hot-toast"; // add

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, isHydrated } = useCart();
  const { user } = useAuth();

  function handleCheckoutClick() {
    if (!user) {
      toast.error("Please log in to continue.");
      router.push("/login?redirect=/cart"); // send them back HERE, not to /checkout
      return;
    }
    router.push("/checkout");
  }

  if (!isHydrated) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-500">Loading cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Browse products and add something you like.</p>
        <Link href="/products" className="mt-6 inline-block rounded-md bg-emerald-600 px-6 py-3 text-white">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Your Cart</h1>

      <div className="divide-y">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 py-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
              <SafeImage src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
            </div>

            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-2 rounded-md border px-2 py-1">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Decrease quantity" className="p-1 hover:text-emerald-600">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label="Increase quantity" className="p-1 hover:text-emerald-600">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <p className="w-20 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</p>

            <button onClick={() => removeItem(item.productId)} aria-label={`Remove ${item.title}`} className="p-1 text-gray-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-2 border-t pt-6">
        <div className="flex w-full max-w-xs justify-between text-lg font-semibold">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout.</p>
        <button
          onClick={handleCheckoutClick}
          className="mt-4 w-full max-w-xs rounded-md bg-emerald-600 px-6 py-3 text-center font-medium text-white hover:bg-emerald-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}