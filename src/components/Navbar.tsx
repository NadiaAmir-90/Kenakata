// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, Menu, X, Search, Home } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const CATEGORY_LINKS = [
  { label: "Clothes", id: 1 },
  { label: "Electronics", id: 2 },
  { label: "Furniture", id: 3 },
  { label: "Shoes", id: 4 },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-gray-900 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-1 text-xl font-bold">
          <Home className="h-5 w-5 text-white" />
          <span className="text-white">Kena</span>
          <span className="text-emerald-600">Kata</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          {CATEGORY_LINKS.map((c) => (
            <Link
              key={c.id}
              href={`/products?categoryId=${c.id}`}
              className="text-sm text-emerald-600 hover:text-white-600"
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/products" aria-label="Search products">
            <Search className="h-5 w-5" />
          </Link>

          <Link href="/cart" className="relative" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm">{user.name}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block" aria-label="Login">
              <User className="h-5 w-5" />
            </Link>
          )}

          <button
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-3 border-t bg-gray-900 px-4 py-3 md:hidden">
          {CATEGORY_LINKS.map((c) => (
            <Link
              key={c.id}
              href={`/products?categoryId=${c.id}`}
              onClick={() => setMobileOpen(false)}
            >
              {c.label}
            </Link>
          ))}
          {user ? (
            <button onClick={logout} className="text-left text-white-500">
              Logout ({user.name})
            </button>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
