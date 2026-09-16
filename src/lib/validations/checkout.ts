// src/lib/validations/checkout.ts
import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, "Card number must be exactly 16 digits"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format must be MM/YY"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3-4 digits"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;