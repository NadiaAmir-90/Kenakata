// src/hooks/use-checkout-form.ts
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { checkoutSchema, CheckoutFormData } from "@/lib/validations/checkout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export type CheckoutStatus = "idle" | "submitting" | "success" | "error";

const DRAFT_KEY = "kenakata_checkout_draft_v1";

export function useCheckoutForm() {
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const hasHydratedDraft = useRef(false);

  const form = useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema) });
  const { watch, reset } = form;

  // Restore any saved draft once, on mount — this is what makes values
  // survive the logout → login → redirect-back round trip.
  useEffect(() => {
    if (hasHydratedDraft.current) return;
    hasHydratedDraft.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) reset(JSON.parse(raw));
    } catch {
      // corrupted draft — ignore, user just retypes
    }
  }, [reset]);

  // Persist on every change so a draft exists even if the user gets
  // redirected before submitting (e.g. logs out mid-checkout).
  useEffect(() => {
    const subscription = watch((values) => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        // storage full/unavailable — non-critical, skip silently
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  async function onSubmit(data: CheckoutFormData) {
    if (!user) {
      toast.error("Please log in to complete your order.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (data.cardNumber === "0000000000000000") reject(new Error("Card declined"));
          else resolve(true);
        }, 1500);
      });
      clearCart();
      localStorage.removeItem(DRAFT_KEY); // clear the draft — order is done
      setStatus("success");
      toast.success("Order placed successfully!");
    } catch (err) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Payment failed. Try again.");
    }
  }

  return { ...form, status, setStatus, onSubmit: form.handleSubmit(onSubmit) };
}