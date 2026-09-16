// src/app/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success("Welcome back!");
      router.push(searchParams.get("redirect") || "/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid email or password";
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="mb-6 text-2xl font-semibold">Log In</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input {...register("email")} placeholder="Email" className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting ? "Logging in…" : "Log In"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-emerald-600 hover:underline">
          Register
        </Link>
      </p>

      {/* Handy for testing against the live API's seeded accounts */}
      <p className="mt-2 text-center text-xs text-gray-400">
        Test login: john@mail.com / changeme
      </p>
    </div>
  );
}