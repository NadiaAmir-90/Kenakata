// src/app/checkout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutForm } from "@/hooks/use-checkout-form";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";

const STEPS = ["Shipping", "Payment", "Confirmation"];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { items, subtotal } = useCart();
  const {
    register,
    formState: { errors },
    status,
    onSubmit,
    setStatus,
  } = useCheckoutForm();

  // Re-check auth on every render, not just on initial navigation —
  // catches the case where the user logs out while already on this page.
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [authLoading, user, router]);

  // While auth state is loading, or once we know there's no user,
  // render nothing meaningful — the redirect above is about to fire.
  if (authLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-gray-500">Checking session…</div>;
  }

  const stepIndex = status === "success" ? 2 : status === "submitting" ? 1 : 0;

  if (status === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-semibold">Order Confirmed</h1>
        <p className="mt-2 text-gray-500">
          Thanks for your order! This was a mock payment — no real charge was made.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-gray-500">
        Your cart is empty. Add items before checking out.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                i <= stepIndex ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            <span className="text-sm text-gray-600">{label}</span>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-gray-300" />}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="mb-2 font-semibold">Shipping Address</legend>

          <div>
            <input {...register("fullName")} placeholder="Full name" className="w-full rounded-md border px-3 py-2 text-sm" />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          <div>
            <input {...register("email")} placeholder="Email" className="w-full rounded-md border px-3 py-2 text-sm" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <input {...register("address")} placeholder="Street address" className="w-full rounded-md border px-3 py-2 text-sm" />
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input {...register("city")} placeholder="City" className="w-full rounded-md border px-3 py-2 text-sm" />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
            </div>
            <div>
              <input {...register("postalCode")} placeholder="Postal code" className="w-full rounded-md border px-3 py-2 text-sm" />
              {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 font-semibold">Payment (mock)</legend>

          <div>
            <input
              {...register("cardNumber")}
              placeholder="Card number (16 digits)"
              maxLength={16}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input {...register("expiry")} placeholder="MM/YY" className="w-full rounded-md border px-3 py-2 text-sm" />
              {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry.message}</p>}
            </div>
            <div>
              <input {...register("cvv")} placeholder="CVV" maxLength={4} className="w-full rounded-md border px-3 py-2 text-sm" />
              {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv.message}</p>}
            </div>
          </div>
        </fieldset>

        {status === "error" && (
          <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
            Payment failed. Please check your details and try again.
            <button type="button" onClick={() => setStatus("idle")} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-lg font-semibold">Total: ${subtotal.toFixed(2)}</span>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-md bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {status === "submitting" ? "Processing…" : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}