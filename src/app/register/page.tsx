// src/app/register/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { register as registerRequest } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/api";

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

function validateField(name: keyof RegisterValues, value: string, allValues: RegisterValues): string | undefined {
  switch (name) {
    case "name":
      return value.trim().length < 2 ? "Name is too short" : undefined;
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "Invalid email address";
    case "password":
      return value.length < 6 ? "Password must be at least 6 characters" : undefined;
    case "confirmPassword":
      return value !== allValues.password ? "Passwords do not match" : undefined;
    default:
      return undefined;
  }
}

const EMPTY: RegisterValues = { name: "", email: "", password: "", confirmPassword: "" };

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [values, setValues] = useState<RegisterValues>(EMPTY);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (errors[name as keyof RegisterValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleBlur(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof RegisterValues, value, values) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const newErrors: RegisterErrors = {
      name: validateField("name", values.name, values),
      email: validateField("email", values.email, values),
      password: validateField("password", values.password, values),
      confirmPassword: validateField("confirmPassword", values.confirmPassword, values),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerRequest({
        name: values.name,
        email: values.email,
        password: values.password,
        avatar: "https://i.imgur.com/LDOO4Qs.jpg",
      });
      await login({ email: values.email, password: values.password });
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Full name"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
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
        <div>
          <input
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Confirm password"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
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