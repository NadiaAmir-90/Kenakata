// src/services/auth.service.ts
import { apiFetch } from "./api";
import { AuthTokens, LoginPayload, RegisterPayload, User } from "@/types";

export function login(payload: LoginPayload): Promise<AuthTokens> {
  return apiFetch<AuthTokens>(`/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store", // SSR/dynamic — never cache auth
  });
}

export function getProfile(token: string): Promise<User> {
  return apiFetch<User>(`/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export function register(payload: RegisterPayload): Promise<User> {
  return apiFetch<User>(`/users/`, {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}