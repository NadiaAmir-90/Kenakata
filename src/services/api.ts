// src/services/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

interface FetchOptions extends RequestInit {
  revalidate?: number | false; // false = force-cache (SSG-like), number = ISR seconds, omit = default
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  { revalidate, ...options }: FetchOptions = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Rendering strategy hook: pass revalidate: false for SSG,
    // a number for ISR, or omit + cache:'no-store' for SSR/dynamic
    next: revalidate === undefined ? undefined : { revalidate: revalidate === false ? undefined : revalidate },
    cache: revalidate === false ? "force-cache" : options.cache,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || `Request failed: ${res.status}`);
  }

  // some auth endpoints return empty bodies
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}