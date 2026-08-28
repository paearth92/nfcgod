'use client';

import { createContext, useContext, useMemo, useReducer, useCallback, useEffect, useState } from 'react';
import type { Product, ProductVariant } from '@/lib/types';
import { cartService, type CartLineShape } from '@/lib/cart-service';

export interface CartLine extends CartLineShape {}

interface CartState {
  lines: CartLine[];
}

type CartAction =
  | { type: 'ADD'; product: Product; variant: ProductVariant; quantity: number }
  | { type: 'REMOVE'; variantId: string }
  | { type: 'SET_QTY'; variantId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; lines: CartLineShape[] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { lines: action.lines };
    case 'ADD': {
      const existing = state.lines.find((l) => l.variantId === action.variant.id);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.variantId === action.variant.id
              ? { ...l, quantity: l.quantity + action.quantity }
              : l
          ),
        };
      }
      return {
        lines: [
          ...state.lines,
          {
            productId: action.product.id,
            productSlug: action.product.slug,
            productName: action.product.name,
            variantId: action.variant.id,
            variantName: action.variant.name,
            sku: action.variant.sku,
            price: action.variant.price,
            quantity: action.quantity,
          },
        ],
      };
    }
    case 'REMOVE':
      return { lines: state.lines.filter((l) => l.variantId !== action.variantId) };
    case 'SET_QTY':
      if (action.quantity <= 0) {
        return { lines: state.lines.filter((l) => l.variantId !== action.variantId) };
      }
      return {
        lines: state.lines.map((l) =>
          l.variantId === action.variantId ? { ...l, quantity: action.quantity } : l
        ),
      };
    case 'CLEAR':
      return { lines: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (product: Product, variant: ProductVariant, quantity?: number) => void;
  remove: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  hydrated: boolean;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const lines = cartService.load();
    dispatch({ type: 'HYDRATE', lines });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      cartService.save(state.lines);
    }
  }, [state.lines, hydrated]);

  const add = useCallback(
    (product: Product, variant: ProductVariant, quantity = 1) => {
      dispatch({ type: 'ADD', product, variant, quantity });
    },
    []
  );
  const remove = useCallback((variantId: string) => dispatch({ type: 'REMOVE', variantId }), []);
  const setQuantity = useCallback(
    (variantId: string, quantity: number) => dispatch({ type: 'SET_QTY', variantId, quantity }),
    []
  );
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = state.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    return { lines: state.lines, count, subtotal, add, remove, setQuantity, clear, hydrated, cartOpen, openCart, closeCart };
  }, [state.lines, add, remove, setQuantity, clear, hydrated, cartOpen, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
