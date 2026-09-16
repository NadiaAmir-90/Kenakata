// src/context/CartContext.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { CartItem } from "@/types";

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity">; quantity?: number }
  | { type: "REMOVE_ITEM"; payload: { productId: number } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; payload: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "ADD_ITEM": {
      const qty = action.quantity ?? 1;
      const existing = state.find((i) => i.productId === action.payload.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === action.payload.productId ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...state, { ...action.payload, quantity: qty }];
    }
    case "UPDATE_QUANTITY":
      return state
        .map((i) => (i.productId === action.payload.productId ? { ...i, quantity: action.payload.quantity } : i))
        .filter((i) => i.quantity > 0);
    case "REMOVE_ITEM":
      return state.filter((i) => i.productId !== action.payload.productId);
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "kenakata_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage once on mount (avoids SSR/client mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", payload: JSON.parse(raw) });
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist on every change, but only after initial hydration
  useEffect(() => {
    if (isHydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem: (item, quantity) => dispatch({ type: "ADD_ITEM", payload: item, quantity }),
      removeItem: (productId) => dispatch({ type: "REMOVE_ITEM", payload: { productId } }),
      updateQuantity: (productId, quantity) => dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      isHydrated,
    }),
    [items, isHydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}