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

// One cart per identity: "guest" when logged out, the user's own id when logged in.
// This is what prevents User A's items from leaking into User B's session.
function getStorageKey(userId: number | string | undefined) {
  return userId ? `kenakata_cart_v1_${userId}` : "kenakata_cart_v1_guest";
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isHydrated, setIsHydrated] = useState(false);
  const currentKeyRef = useRef<string | null>(null);

  const storageKey = getStorageKey(user?.id);

  // Re-hydrate whenever the effective identity changes (login, logout, or
  // switching between two different accounts on the same browser).
  // Waits for auth to finish resolving first, so we don't briefly load the
  // guest cart before the real user is known on page refresh.
  useEffect(() => {
    if (authLoading) return;
    if (currentKeyRef.current === storageKey) return; // no actual identity change

    currentKeyRef.current = storageKey;
    try {
      const raw = localStorage.getItem(storageKey);
      dispatch({ type: "HYDRATE", payload: raw ? JSON.parse(raw) : [] });
    } catch {
      dispatch({ type: "HYDRATE", payload: [] });
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey, authLoading]);

  // Persist under the *current* key on every change, only after initial hydration
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