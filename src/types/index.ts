// ── Products & Categories ──────────────────────────────
export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  description: string;
  category: Category;
  images: string[];
  creationAt?: string;
  updatedAt?: string;
}

export interface ProductsQuery {
  limit?: number;
  offset?: number;
  categoryId?: number;
  title?: string;
  priceMin?: number;
  priceMax?: number;
}

// ── Users & Auth ────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  name: string;
  role: "customer" | "admin";
  avatar: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

// ── Cart ────────────────────────────────────────────────
export interface CartItem {
  productId: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}