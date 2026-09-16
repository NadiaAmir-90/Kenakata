// src/components/Footer.tsx
import Link from "next/link";
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { Mail } from "lucide-react";

const CATEGORY_LINKS = [
  { label: "Clothes", id: 1 },
  { label: "Electronics", id: 2 },
  { label: "Furniture", id: 3 },
  { label: "Shoes", id: 4 },
];

const QUICK_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Cart", href: "/cart" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
];

const SUPPORT_LINKS = [
  { label: "Shipping & Returns", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Us", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold text-white">
              Kena<span className="text-emerald-500">Kata</span>
            </h3>
            <p className="mt-3 text-sm text-gray-400">
              Quality products, honest prices, delivered fast.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-400 hover:text-emerald-500"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-400 hover:text-emerald-500"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-400 hover:text-emerald-500"
              >
                <FaXTwitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@kenakata.com"
                aria-label="Email"
                className="text-gray-400 hover:text-emerald-500"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-white">Shop</h4>
            <ul className="mt-3 space-y-2">
              {CATEGORY_LINKS.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?categoryId=${c.id}`}
                    className="text-sm hover:text-emerald-500"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white">Quick Links</h4>
            <ul className="mt-3 space-y-2">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-emerald-500"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white">Support</h4>
            <ul className="mt-3 space-y-2">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-emerald-500"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} KenaKata.com — All rights reserved.
          </p>
          <p>Built with Next.js</p>
        </div>
      </div>
    </footer>
  );
}
