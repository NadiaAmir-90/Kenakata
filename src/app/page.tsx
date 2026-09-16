// src/app/page.tsx
import Link from "next/link";
import Image from "next/image"; // kept for the hero — a trusted local asset, not remote data
import { getProducts } from "@/services/products.service";
import { getCategories } from "@/services/categories.service";
import ProductGrid from "@/components/products/ProductGrid";
import SafeImage from "@/components/ui/SafeImage";
import ExpandableGrid from "@/components/ui/ExpandableGrid";

export const revalidate = 300;

export default async function Home() {
  const [featured, categories] = await Promise.all([
    getProducts({ limit: 8 }),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[500px] overflow-hidden text-white">
        <Image
          src="/hero-banner.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />

        {/* Optional dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[500px] max-w-7xl flex-col items-start justify-center gap-4 px-4 py-24">
          <h1 className="text-4xl font-bold md:text-5xl">
            Shop smarter with KenaKata
          </h1>

          <p className="max-w-lg text-gray-200">
            Quality products, honest prices, delivered fast. Explore our full
            catalog today.
          </p>

          <Link
            href="/products"
            className="rounded-md bg-emerald-500 px-6 py-3 font-medium text-white hover:bg-emerald-600"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories — always 8 slots, real categories or placeholders */}
      {/* Categories */}
<section className="mx-auto max-w-7xl px-4 py-12">
  <h2 className="mb-6 text-2xl font-semibold">
    Categories
  </h2>

  {/* Mobile Show More */}
  <div className="mb-4 flex justify-end md:hidden">
    <Link
      href="/products"
      className="text-sm font-medium text-emerald-600"
    >
      Show More
    </Link>
  </div>

  {/* Categories */}
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => {
      const cat = categories[i];

      if (!cat) {
        return (
          <div
            key={`placeholder-${i}`}
            className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
          >
            <SafeImage
              src={null}
              alt=""
              fill
              className="object-cover opacity-50"
              sizes="(max-width: 768px) 50vw, 25vw"
            />

            <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
              Coming soon
            </span>
          </div>
        );
      }

      return (
        <Link
          key={cat.id}
          href={`/products?categoryId=${cat.id}`}
          className={`group relative aspect-square overflow-hidden rounded-lg ${
            i >= 4 ? "hidden md:block" : ""
          }`}
        >
          <SafeImage
            src={cat.image}
            alt={cat.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          <div className="absolute inset-0 flex items-end bg-black/30 p-3">
            <span className="font-medium text-white">
              {cat.name}
            </span>
          </div>
        </Link>
      );
    })}
  </div>
</section>
      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-semibold">Just For You</h2>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
