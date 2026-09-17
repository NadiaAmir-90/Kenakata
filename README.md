This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.









<<div align="center">

# 🛍️ KenaKata.com

**A production-style e-commerce storefront built with Next.js App Router**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

Powered by the [Platzi Fake Store API](https://api.escuelajs.co/api/v1)

**[🔗 Live Demo](https://your-app.vercel.app)** *(replace with your real Vercel URL after deploying)*

</div>

---

A capstone project demonstrating scalable frontend architecture, modern Next.js rendering patterns, and production engineering habits — including resilience against a public, crowd-writable API.

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Folder Structure](#-folder-structure)
- [Rendering Strategy](#-rendering-strategy)
- [Architectural Tradeoffs](#-architectural-tradeoffs)
- [Performance Considerations](#-performance-considerations)
- [Challenges Faced](#-challenges-faced)
- [Future Improvements](#-future-improvements)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)

---

## ✨ Features

**Public Storefront**
- Home page with hero section, category grid, and featured products
- Mobile-responsive "show 4, expand to show all" behavior on category and featured-product grids (desktop always shows the full set)
- Product listing with search, category filtering, price sorting, and pagination — all driven by shareable URL search parameters
- Dedicated `loading.tsx` skeletons and `error.tsx` boundaries on listing and detail routes
- Product detail page with image gallery, related products, and add-to-cart
- Universal `SafeImage` component: every image on the site (product, category, cart) falls back to a local placeholder instead of ever showing a broken image or crashing the page — necessary because the underlying API is public and write-anyone, and regularly contains untrusted or dead image URLs

**Cart & Checkout**
- Persistent cart (add/remove/update quantity/clear) backed by `localStorage`, hydrated safely on mount to avoid SSR/client mismatches
- Checkout form with manually implemented validation (controlled inputs + a hand-written per-field validator) covering shipping address and mock card details — no form/schema library
- Step indicator (Shipping → Payment → Confirmation) and a mock payment flow with simulated success/failure states
- Checkout form drafts persist across auth interruptions — if a user is redirected to log in mid-checkout, their typed fields are restored automatically on return

**Authentication**
- Login and registration against the live Platzi Fake Store auth endpoints, both with the same manual validation approach as checkout
- Session persistence via token + profile fetch on app load
- Logout
- Two-layer route protection: middleware blocks unauthenticated navigation to protected routes, and a client-side auth guard inside the checkout page itself catches the case where a user logs out *while already on* a protected page (middleware alone only fires on navigation, not on client-side state changes)
- Context-aware login redirects: whichever page a user was on when prompted to log in (cart, checkout, etc.) is where they return to after a successful login
- User menu redesigned as a single account icon in the navbar that opens a dropdown (Login/Register when logged out, profile name + Logout when logged in), closed on outside click

---

## 🧰 Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Forms & Validation | Manual — controlled components + hand-written field validators (no form/schema library) |
| State Management | React Context API (`CartContext`, `AuthContext`) |
| Icons | lucide-react |
| Notifications | react-hot-toast |
| Data Source | [Platzi Fake Store API](https://api.escuelajs.co/api/v1) |
| Deployment | Vercel |

---

## 🏗️ Architecture

The codebase separates concerns into four layers, each with a single responsibility, so data flow only ever moves in one direction:

```
services/  →  context/  →  components/
   ↑              ↑
 (data)      (client state)
```

- **`app/`** — routing and composition only. No fetch calls or business rules live here directly; pages import from `services/` and `context/`.
- **`services/`** — the data layer. Pure functions wrapping `fetch`, with zero React dependencies — fully unit-testable in isolation, independent of any UI framework.
- **`context/`** — client state layer (cart, auth). Owns state and exposes actions via hooks (`useCart()`, `useAuth()`); never renders UI itself.
- **`components/`** — presentation layer. Receives data and handlers as props or via context hooks; never imports `services/` directly.

This boundary was maintained deliberately throughout the build so that UI could be iterated on freely (including AI-assisted styling passes) without ever touching the underlying logic, and vice versa — the logic layer (cart reducer, auth flow, checkout validation, image safety handling) was written and owned independently of how any given screen looks.

---

## 📁 Folder Structure

```
src/
  app/
    layout.tsx                # Root layout — providers, Navbar, Footer, Toaster
    page.tsx                  # Home — Server Component (ISR)
    products/
      page.tsx                # Listing — search/filter/sort/pagination via URL params
      [id]/page.tsx            # Detail — SSG + ISR fallback
      loading.tsx / error.tsx
    cart/page.tsx              # Client Component — reads CartContext
    checkout/page.tsx          # Client Component — protected, auth-aware
    login/page.tsx
    register/page.tsx
    api/auth/route.ts          # Route handler — sets auth cookie
  components/
    ui/                       # SafeImage, ExpandableGrid — shared, reusable primitives
    products/                 # ProductCard, ProductGrid, ProductGallery, ProductFilters
    layout/                   # Navbar, Footer
  services/
    api.ts                    # apiFetch wrapper — caching/revalidation config lives here
    products.service.ts
    categories.service.ts
    auth.service.ts
  context/
    CartContext.tsx
    AuthContext.tsx
  lib/
    safe-image.ts              # Trusted-hostname + image-shape validation
  hooks/
    use-checkout-form.ts        # Manual controlled-form state, validation, and draft persistence
  types/
    index.ts                    # Product, Category, User, AuthTokens, CartItem
  middleware.ts                 # Route protection (checkout, profile, account)
```

---

## ⚡ Rendering Strategy

| Page | Strategy | Why |
|---|---|---|
| Home | ISR, `revalidate: 300` | Featured products/categories change occasionally; freshness isn't critical enough to justify per-request SSR |
| Product listing | SSR (dynamic, depends on URL search params) | Search/filter/sort results must reflect the exact query in the URL on every request |
| Product detail | SSG via `generateStaticParams` for the first 20 products, ISR fallback (`revalidate: 60`) for the rest | Balances build time against coverage — popular products are pre-built, the long tail is generated on demand and cached |
| Categories | ISR, `revalidate: 3600` | Categories change rarely; a longer cache window reduces redundant API calls |
| Cart | Client-only | Purely local, per-user state; no server round-trip needed or wanted |
| Checkout | Client Component, protected by middleware + a client-side auth guard | Form-heavy and interactive; must react instantly to auth state changing while mounted, which middleware alone cannot catch |
| Auth endpoints | `cache: 'no-store'` | Auth responses must never be cached |

---

## ⚖️ Architectural Tradeoffs

- **Auth cookie is not `httpOnly`.** The token is stored in a plain, JS-readable cookie (mirrored from `localStorage`) so `middleware.ts` can check for its presence. This is weaker against XSS than an `httpOnly` cookie set from a server route handler, which was the more correct approach but required more implementation time than the deadline allowed. Documented here as a known, accepted limitation rather than an oversight.
- **Image safety is handled by an allowlist + validator, not an ever-growing config.** The underlying API is public and write-anyone — its `images` fields regularly contain dead hosts, non-image URLs (e.g. a Google Images search-results page), and unrelated third-party domains from other users' test data. Rather than continuously expanding `next.config.ts`'s `remotePatterns` to chase this, a single `getSafeImageUrl()` validator (hostname allowlist + file-extension check) filters untrusted URLs before they ever reach `next/image`, backed by an `onError` fallback for allowlisted-but-dead links. This keeps the Next.js image security boundary meaningful instead of defeated by a wildcard.
- **Pagination over infinite scroll.** Both satisfy the assignment; pagination was chosen because it composes naturally with the URL-search-params approach already used for search/filter/sort — the full listing state (query, category, sort, page) stays in one shareable, bookmarkable URL, rather than needing separate scroll-position state.
- **Manual form validation instead of React Hook Form + Zod.** All forms (checkout, login, register) use controlled inputs with hand-written per-field validator functions rather than a schema library. This was a deliberate choice for consistency across every form in the app and to demonstrate first-principles form-handling. The tradeoff: weaker compile-time type safety (the form's TypeScript type and its validation rules are two separate things kept in sync by hand, rather than one Zod schema inferring both), and more repeated boilerplate per form than a schema-driven approach would need.
- **Cart persists across login/logout independently of auth state**, by design — this matches standard e-commerce UX (a guest's cart isn't wiped by logging in), but means cart and auth are two genuinely separate state domains that both needed independent persistence and hydration logic.
- **Checkout requires login (no guest checkout).** This was a deliberate choice to satisfy the "Protected routes" requirement meaningfully; a real store might offer guest checkout as an alternative path, which would be a straightforward addition (protect an order-history page instead) if needed later.

---

## 🚀 Performance Considerations

- `next/image` used throughout for automatic image optimization, lazy loading, and responsive `sizes` hints
- ISR on home/category/detail pages avoids re-fetching from the upstream API on every request
- `next/font` (if configured) avoids layout shift from web font loading
- Server Components used by default wherever no interactivity is needed (product listing shell, detail page, category grid) — client-side JS is only shipped for genuinely interactive pieces (cart, filters, forms, image fallback logic)
- Debounced search input (400ms) avoids firing a new request on every keystroke
- `SafeImage`'s validation happens synchronously before render, avoiding wasted network requests to known-bad hostnames

---

## 🧩 Challenges Faced

- **The assignment's listed API base (`fakeapi.platzi.com`) required switching to its current live domain (`api.escuelajs.co`)** after confirming the original wasn't consistently reachable — a reminder that third-party API endpoints can drift from documentation.
- **The API is public and write-anyone**, meaning product/category image data is not trustworthy by default — it includes dead placeholder services, non-image URLs, and arbitrary third-party domains submitted by other developers testing the same API. This required building a dedicated image-safety layer (`getSafeImageUrl` + `SafeImage`) rather than relying on Next.js's `remotePatterns` allowlist alone.
- **Middleware only fires on navigation, not on in-page state changes.** A user logging out while already sitting on a protected page (e.g. mid-checkout) was not caught by middleware alone, since no navigation occurs — this required a second, client-side auth check inside the page itself.
- **Next.js's `middleware` file convention was renamed to `proxy`** during development (framework version change), requiring a migration via the official codemod.

---

## 🔭 Future Improvements

- Wishlist and product reviews (listed as optional in the assignment; not implemented under time constraints)
- `httpOnly` cookie-based auth via a dedicated route handler, replacing the current JS-readable cookie approach
- Guest checkout as an alternative to the current login-required flow
- Unit tests (Vitest) for the cart reducer and form validators
- End-to-end tests covering the auth-interrupt-during-checkout flow specifically, since it's the most state-dependent path in the app
- Docker-based deployment process
- Order history page (would also serve as a second protected route beyond checkout)
- Full-URL-preserving login redirects (currently preserves path only, not query string filters)

---

## ⚙️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/kenakata.git
cd kenakata

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# then edit .env.local if needed — see below

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Build for production locally (optional, to verify before deploying):**
```bash
npm run build
npm run start
```

---

## 🔐 Environment Variables

Create `.env.local` in the project root (never commit this file):

```dotenv
# .env.example
NEXT_PUBLIC_API_URL=https://api.escuelajs.co/api/v1
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the Platzi Fake Store API. Exposed to the client (`NEXT_PUBLIC_` prefix) since product/category data is fetched from both Server and Client Components. |

No secret keys are required — this project uses no server-only credentials, since the underlying API needs none for its public endpoints.

---

## 🚢 Deployment

### Recommended: Vercel

Vercel is used instead of GitHub Pages because this app relies on **middleware, a server route handler, and ISR** — all of which require a Node.js runtime and are not supported by GitHub Pages' static-only hosting. Vercel is built and maintained by the Next.js team and supports every feature used here natively, with no configuration.

**1. Push your project to a public GitHub repository:**
```bash
git init
git add .
git commit -m "Initial commit — KenaKata.com capstone"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kenakata.git
git push -u origin main
```

**2. Deploy on Vercel:**
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New → Project**, then select your `kenakata` repository.
3. Vercel auto-detects Next.js — leave the default build settings as-is.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://api.escuelajs.co/api/v1`
5. Click **Deploy**. Vercel builds and deploys automatically; you'll get a live URL (`your-app.vercel.app`) in a few minutes.
6. Every subsequent `git push` to `main` triggers an automatic redeploy.

**3. Update this README** with your real deployment URL once live (see the top of this file).

### If a static export is specifically required

A static (`next export`)-compatible version of this app would need to drop middleware-based route protection, the `api/auth` route handler, and ISR revalidation — replacing them with client-side-only equivalents. This is **not recommended**, as it removes functionality this assignment explicitly asks for (middleware protection, SSR/ISR rendering strategy). If a static deployment target is a hard requirement, this tradeoff should be flagged to the evaluator directly rather than silently degrading the app's functionality.