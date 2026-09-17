// src/hooks/use-checkout-form.ts
"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export type CheckoutStatus = "idle" | "submitting" | "success" | "error";

export interface CheckoutFormData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

const EMPTY_FORM: CheckoutFormData = {
  fullName: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

type FormErrors = Partial<Record<keyof CheckoutFormData, string>>;

const DRAFT_KEY = "kenakata_checkout_draft_v1";

// One function, one field in, one error message (or undefined) out.
// This is the manual equivalent of a single Zod field rule.
function validateField(name: keyof CheckoutFormData, value: string): string | undefined {
  switch (name) {
    case "fullName":
      return value.trim().length < 2 ? "Name is too short" : undefined;
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "Invalid email address";
    case "address":
      return value.trim().length < 5 ? "Address is too short" : undefined;
    case "city":
      return value.trim().length < 2 ? "City is required" : undefined;
    case "postalCode":
      return value.trim().length < 3 ? "Postal code is required" : undefined;
    case "cardNumber":
      return /^\d{16}$/.test(value) ? undefined : "Card number must be exactly 16 digits";
    case "expiry":
      return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value) ? undefined : "Format must be MM/YY";
    case "cvv":
      return /^\d{3,4}$/.test(value) ? undefined : "CVV must be 3-4 digits";
    default:
      return undefined;
  }
}

function validateAll(data: CheckoutFormData): FormErrors {
  const errors: FormErrors = {};
  (Object.keys(data) as (keyof CheckoutFormData)[]).forEach((key) => {
    const message = validateField(key, data[key]);
    if (message) errors[key] = message;
  });
  return errors;
}

export function useCheckoutForm() {
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [values, setValues] = useState<CheckoutFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const hasHydratedDraft = useRef(false);

  // Restore a saved draft once on mount — same purpose as the RHF version:
  // survive a logout → login → redirect-back round trip.
  useEffect(() => {
    if (hasHydratedDraft.current) return;
    hasHydratedDraft.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setValues(JSON.parse(raw));
    } catch {
      // corrupted draft — ignore, user just retypes
    }
  }, []);

  // Persist the draft on every change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      // storage full/unavailable — non-critical
    }
  }, [values]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    // Clear that field's error as soon as the user edits it, so the
    // error message doesn't linger after they've started fixing it.
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  // Validate one field the moment the user leaves it — gives feedback
  // earlier than waiting for full submit, without validating on every keystroke.
  function handleBlur(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const message = validateField(name as keyof CheckoutFormData, value);
    setErrors((prev) => ({ ...prev, [name]: message }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateAll(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before continuing.");
      return; // block submission — this is the manual equivalent of zodResolver
    }

    if (!user) {
      toast.error("Please log in to complete your order.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (values.cardNumber === "0000000000000000") reject(new Error("Card declined"));
          else resolve(true);
        }, 1500);
      });
      clearCart();
      localStorage.removeItem(DRAFT_KEY);
      setStatus("success");
      toast.success("Order placed successfully!");
    } catch (err) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Payment failed. Try again.");
    }
  }

  return { values, errors, status, setStatus, handleChange, handleBlur, handleSubmit };
}