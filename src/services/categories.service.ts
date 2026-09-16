// src/services/categories.service.ts
import { apiFetch } from "./api";
import { Category } from "@/types";

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>(`/categories`, { revalidate: 3600 });
}