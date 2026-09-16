// src/app/register/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";
import { register as registerRequest } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/api";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await registerRequest({
        name: data.name,
        email: data.email,
        password: data.password,
        avatar: "https://i.imgur.com/LDOO4Qs.jpg", // Platzi requires a valid image URL on signup
      });
      // auto-login right after successful registration
      await login({ email: data.email, password: data.password });
      toast.success("Account created!");
      router.push("/");
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 400
          ? "That email is already registered."
          : "Registration failed. Please try again.";
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="mb-6 text-2xl font-semibold">Create Account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input {...registerField("name")} placeholder="Full name" className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <input {...registerField("email")} placeholder="Email" className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <input
            {...registerField("password")}
            type="password"
            placeholder="Password"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div>
          <input
            {...registerField("confirmPassword")}
            type="password"
            placeholder="Confirm password"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creating account…" : "Register"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-600 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}
