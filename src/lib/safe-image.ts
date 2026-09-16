// src/lib/safe-image.ts
const TRUSTED_IMAGE_HOSTS = new Set([
  "i.imgur.com",
  "placehold.co",
  "api.escuelajs.co",
]);

export function getSafeImageUrl(url: string | undefined | null): string {
  if (!url) return "/placeholder.png";
  try {
    const { hostname, pathname } = new URL(url);
    const looksLikeImage = /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(pathname) || hostname === "placehold.co";
    if (TRUSTED_IMAGE_HOSTS.has(hostname) && looksLikeImage) {
      return url;
    }
    return "/placeholder.png";
  } catch {
    return "/placeholder.png"; // malformed URL
  }
}