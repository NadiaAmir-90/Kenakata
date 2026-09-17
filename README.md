<<div align="center">

# 🛍️ KenaKata.com

**A production-style e-commerce storefront built with Next.js App Router**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

Powered by the [Platzi Fake Store API](https://api.escuelajs.co/api/v1)

**[🔗 Live Demo](https://kenakata-1.vercel.app/)** 

</div>
---

##  Table of Contents

- [Setup Instructions](#-setup-instructions)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Rendering Strategy](#-rendering-strategy)
- [Architectural Tradeoffs](#-architectural-tradeoffs)
- [Performance Considerations](#-performance-considerations)
- [Challenges Faced](#-challenges-faced)
- [Future Improvements](#-future-improvements)

---

##  Setup Instructions

```bash
# Clone the repository
git clone https://github.com/NadiaAmir-90/kenakata.git
cd kenakata

# Install dependencies
npm install

# Set up environment variables
cp  .env.local
# then edit .env.local with NEXT_PUBLIC_API_URL=https://api.escuelajs.co/api/v1

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## Features

**Public Storefront**
- Hero, category grid, and featured products on the home page
- Mobile "show 4, expand" behavior on category/featured grids (desktop shows all)
- Search, category filtering, price sorting, and pagination — driven by URL params
- `loading.tsx` / `error.tsx` boundaries on listing and detail routes
- Product detail page: gallery, related products, add-to-cart
- `SafeImage`: every image falls back to a placeholder instead of breaking, since the underlying API is public/write-anyone and regularly has bad image URLs
- Stable category labels (`getCategoryLabel`) — protects the UI from vandalized category names on the same public API

**Cart & Checkout**
- Persistent cart (add/remove/update/clear), scoped per logged-in user, hydrated safely to avoid SSR/client mismatches
- Guest cart merges into the account cart on login instead of being discarded
- Manual checkout validation (controlled inputs + hand-written validators, no form library)
- Step indicator + mock payment flow with success/failure states
- Checkout drafts persist across auth interruptions

**Authentication**
- Login/register against the live Platzi auth endpoints, same manual validation approach
- Session persistence via token + profile fetch on load
- Logout
- Two-layer protection: middleware blocks unauthenticated navigation; a client-side guard on `/checkout` catches logout-while-already-there, which middleware alone can't
- Context-aware login redirects back to whichever page prompted the login
- Account icon + dropdown (Login/Register when logged out, name + Logout when logged in)

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Forms & Validation | Manual — controlled components + hand-written validators |
| State Management | React Context API (`CartContext`, `AuthContext`) |
| Icons | lucide-react |
| Notifications | react-hot-toast |
| Data Source | [Platzi Fake Store API](https://api.escuelajs.co/api/v1) |
| Deployment | Vercel |

---

## Architecture

```
services/  →  context/  →  components/
   ↑              ↑
 (data)      (client state)
```

- **`app/`** — routing/composition only, no fetch or business logic
- **`services/`** — pure fetch-wrapping functions, no React, unit-testable
- **`context/`** — owns cart/auth state, exposes it via `useCart()` / `useAuth()`
- **`components/`** — presentational, receives data via props/hooks, never imports `services/` directly

One-directional data flow — kept deliberately so UI could be restyled freely without touching logic underneath.

---

##  Rendering Strategy

| Page | Strategy | Why |
|---|---|---|
| Home | ISR, `revalidate: 300` | Freshness not critical for featured content |
| Product listing | SSR | Must reflect live search/filter/sort query params |
| Product detail | SSG (first 20) + ISR fallback | Balances build time vs. coverage |
| Categories | ISR, `revalidate: 3600` | Rarely changes |
| Cart | Client-only | Purely local, per-user state |
| Checkout | Client, middleware + client-side auth guard | Must react to logout mid-session |
| Auth endpoints | `cache: 'no-store'` | Never cache auth responses |

---

## Architectural Tradeoffs

- **Auth cookie isn't `httpOnly`** — mirrored from `localStorage` so middleware can read it; weaker against XSS than a server-set `httpOnly` cookie.
- **Image safety via allowlist + validator, not an ever-growing config** — a single `getSafeImageUrl()` filters untrusted URLs before `next/image` sees them, backed by `onError`, instead of chasing every bad domain in `remotePatterns`.
- **Pagination over infinite scroll** — composes naturally with the URL-params approach already used for search/filter/sort.
- **Manual form validation instead of React Hook Form + Zod** — consistent across every form; costs compile-time type safety and some boilerplate.
- **Cart is per-user, with guest→account merge on login** — matches standard e-commerce UX; required its own identity-aware hydration logic (see Challenges).
- **Checkout requires login (no guest checkout)** — deliberate, to make "Protected routes" meaningful.

---

##  Performance Considerations

- `next/image` throughout for optimization, lazy loading, responsive `sizes`
- ISR on home/category/detail avoids re-fetching every request
- Server Components by default; client JS only where interactivity is needed
- Debounced search (400ms)
- `SafeImage` validates synchronously, avoiding wasted requests to known-bad hosts

---

##  Challenges Faced

- **API base drifted from the assignment's listed URL** (`fakeapi.platzi.com` → `api.escuelajs.co`).
- **Public, write-anyone API means no field is trustworthy by default** — required a dedicated image-safety layer (`getSafeImageUrl` + `SafeImage`) and a stable category-label override map, after live category *names* (not just images) were found vandalized by other testers.
- **Middleware only fires on navigation** — a user logging out while already on `/checkout` wasn't caught, since no navigation occurs. Fixed with a second, client-side auth check inside the page.
- **`middleware` was renamed to `proxy`** mid-development (framework version change); migrated via the official codemod.
- **`useSearchParams()` without `Suspense` passed locally but failed the Vercel build** — Next.js requires a `Suspense` boundary for it during static prerendering. Only surfaced in `next build`, not `next dev`.
- **API returned a non-standard `400` (not `404`) for a deleted product**, crashing the build during static generation. Fixed by matching on the actual `EntityNotFoundError` message, not just status code.
- **Cart items leaked between different logged-in users on the same browser** — fixed by scoping the `localStorage` key to the user's id.
- **Guest cart was silently discarded on login instead of carrying over** — adding items while logged out, then logging in, showed an empty cart even though the guest items still existed in storage under a separate key. The initial fix (inferring "a login just happened" from a ref comparison across renders) was too fragile and timing-dependent to reliably detect the transition. Replaced with an explicit merge: `AuthContext.login()` now directly calls a `mergeGuestCartIntoUser()` function the moment login succeeds, writing the merged cart to storage before any component re-renders — removing the guesswork entirely.

---

## Future Improvements

- Wishlist and product reviews (optional in the assignment)
- `httpOnly` cookie-based auth via a route handler
- Guest checkout as an alternative flow
- Migrate validation to React Hook Form + Zod
- Unit tests (Vitest) for cart reducer and validators
- E2E tests for the auth-interrupt-during-checkout flow
- Docker-based deployment
- Order history page (second protected route)
- Full-URL-preserving login redirects

---
