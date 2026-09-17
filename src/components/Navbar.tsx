// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Home,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/ui/UserAvatar";
import { CATEGORY_LABEL_OVERRIDES } from "@/lib/category-labels";
const CATEGORY_LINKS = [
  { label: CATEGORY_LABEL_OVERRIDES[1], id: 1 },
  { label: CATEGORY_LABEL_OVERRIDES[2], id: 2 },
  { label: CATEGORY_LABEL_OVERRIDES[3], id: 3 },
  { label: CATEGORY_LABEL_OVERRIDES[4], id: 4 },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  const loginHref =
    pathname === "/login"
      ? "/login"
      : `/login?redirect=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/"; // full page reload, always lands at the top
          }}
          className="flex items-center gap-1 text-xl font-bold"
        >
          <Home className="h-5 w-5 text-white" />
          <span className="text-white">Kena</span>
          <span className="text-emerald-600">Kata</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          {CATEGORY_LINKS.map((c) => (
            <Link
              key={c.id}
              href={`/products?categoryId=${c.id}`}
              className="text-sm text-emerald-500 hover:text-white"
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-white">
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

          {/* User icon/avatar + dropdown */}
          <div className="relative hidden md:block" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-label="Account menu"
              className="flex items-center justify-center rounded-full hover:opacity-80"
            >
              {user ? (
                <UserAvatar name={user.name} />
              ) : (
                <User className="h-5 w-5" />
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-700 bg-gray-900 py-1 shadow-lg">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 border-b border-gray-700 px-4 py-2">
                      <UserAvatar name={user.name} size="h-6 w-6" />
                      <span className="text-sm font-medium text-white">
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={loginHref}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                    >
                      <UserPlus className="h-4 w-4" />
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

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
        <div className="flex flex-col gap-3 border-t border-gray-800 bg-gray-900 px-4 py-3 text-white md:hidden">
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
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
                router.push("/");
              }}
              className="flex items-center gap-2 text-left text-gray-400"
            >
              <UserAvatar name={user.name} size="h-5 w-5" />
              Logout ({user.name})
            </button>
          ) : (
            <>
              <Link href={loginHref} onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
