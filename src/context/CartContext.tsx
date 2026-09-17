// src/context/CartContext.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
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

// Combine two carts, summing quantities for any product present in both.
function mergeCarts(a: CartItem[], b: CartItem[]): CartItem[] {
  const merged = [...a];
  for (const item of b) {
    const existing = merged.find((i) => i.productId === item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.push({ ...item });
    }
  }
  return merged;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isHydrated, setIsHydrated] = useState(false);
  const currentKeyRef = useRef<string | null>(null);
  const previousUserRef = useRef<string | number | undefined>(undefined);

  const storageKey = getStorageKey(user?.id);

  useEffect(() => {
    if (authLoading) return;
    if (currentKeyRef.current === storageKey) return;

    const wasGuest = previousUserRef.current === undefined;
    const isNowLoggedIn = user?.id !== undefined;

    try {
      if (wasGuest && isNowLoggedIn) {
        // Just logged in — merge whatever was in the guest cart into this
        // user's own cart, then clear the guest cart so it isn't merged
        // again on a future login from a different account.
        const guestRaw = localStorage.getItem(GUEST_KEY);
        const guestItems: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];

        const userRaw = localStorage.getItem(storageKey);
        const userItems: CartItem[] = userRaw ? JSON.parse(userRaw) : [];

        const merged = mergeCarts(userItems, guestItems);
        dispatch({ type: "HYDRATE", payload: merged });
        localStorage.setItem(storageKey, JSON.stringify(merged));

        if (guestItems.length > 0) {
          localStorage.removeItem(GUEST_KEY);
        }
      } else {
        const raw = localStorage.getItem(storageKey);
        dispatch({ type: "HYDRATE", payload: raw ? JSON.parse(raw) : [] });
      }
    } catch {
      dispatch({ type: "HYDRATE", payload: [] });
    } finally {
      setIsHydrated(true);
      currentKeyRef.current = storageKey;
      previousUserRef.current = user?.id;
    }
  }, [storageKey, authLoading, user?.id]);

  useEffect(() => {
    if (!isHydrated || currentKeyRef.current !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // storage full/unavailable — non-critical
    }
  }, [items, isHydrated, storageKey]);

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