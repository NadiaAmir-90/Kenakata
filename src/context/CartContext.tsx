// src/context/CartContext.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { CartItem } from "@/types";
import { useAuth } from "@/context/AuthContext";

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
const GUEST_KEY = "kenakata_cart_v1_guest";

function getStorageKey(userId: number | string | undefined) {
  return userId ? `kenakata_cart_v1_${userId}` : GUEST_KEY;
}

function mergeCarts(a: CartItem[], b: CartItem[]): CartItem[] {
  const merged = a.map((i) => ({ ...i }));
  for (const item of b) {
    const existing = merged.find((i) => i.productId === item.productId);
    if (existing) existing.quantity += item.quantity;
    else merged.push({ ...item });
  }
  return merged;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const storageKey = getStorageKey(user?.id);

  // Plain load — no merge inference here at all, just "load whatever is
  // saved under the current identity's key." Simple and reliable.
  useEffect(() => {
    if (authLoading) return;
    if (loadedKey === storageKey) return;

    try {
      const raw = localStorage.getItem(storageKey);
      dispatch({ type: "HYDRATE", payload: raw ? JSON.parse(raw) : [] });
    } catch {
      dispatch({ type: "HYDRATE", payload: [] });
    } finally {
      setIsHydrated(true);
      setLoadedKey(storageKey);
    }
  }, [storageKey, authLoading, loadedKey]);

  useEffect(() => {
    if (!isHydrated || loadedKey !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // non-critical
    }
  }, [items, isHydrated, storageKey, loadedKey]);

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

// Called explicitly, once, right after a successful login — not inferred
// from render timing. Exported so AuthContext's login() can call it directly.
export function mergeGuestCartIntoUser(userId: number | string) {
  try {
    const guestRaw = localStorage.getItem(GUEST_KEY);
    const guestItems: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];
    if (guestItems.length === 0) return;

    const userKey = getStorageKey(userId);
    const userRaw = localStorage.getItem(userKey);
    const userItems: CartItem[] = userRaw ? JSON.parse(userRaw) : [];

    const merged = mergeCarts(userItems, guestItems);
    localStorage.setItem(userKey, JSON.stringify(merged));
    localStorage.removeItem(GUEST_KEY);
  } catch {
    // non-critical — worst case, guest items are simply not carried over
  }
}