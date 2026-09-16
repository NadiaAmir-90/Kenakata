// src/services/products.service.ts
import { apiFetch } from "./api";
import { Product, ProductsQuery, Category } from "@/types";

export function getProducts(query: ProductsQuery = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query.limit) params.set("limit", String(query.limit));
  if (query.offset) params.set("offset", String(query.offset));
  if (query.categoryId) params.set("categoryId", String(query.categoryId));
  if (query.title) params.set("title", query.title);
  if (query.priceMin) params.set("price_min", String(query.priceMin));
  if (query.priceMax) params.set("price_max", String(query.priceMax));

  return apiFetch<Product[]>(`/products?${params.toString()}`, { revalidate: 60 }); // ISR
}

export function getProductById(id: number | string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { revalidate: 60 });
}

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>(`/categories`, { revalidate: 3600 }); // rarely changes
}