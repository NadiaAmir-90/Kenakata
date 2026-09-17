// src/app/login/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface LoginValues {
  email: string;
  password: string;
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

function validateField(name: keyof LoginValues, value: string): string | undefined {
  if (name === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "Invalid email address";
  }
  if (name === "password") {
    return value.length < 6 ? "Password must be at least 6 characters" : undefined;
  }
  return undefined;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleBlur(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof LoginValues, value) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const newErrors: LoginErrors = {
      email: validateField("email", values.email),
      password: validateField("password", values.password),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(values);
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Email"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <input
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Password"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
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

      <p className="mt-2 text-center text-xs text-gray-400">Test login: john@mail.com / changeme</p>
    </div>
  );
}