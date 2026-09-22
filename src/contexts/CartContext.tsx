import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Product, ProductVariant } from '../lib/api';

// ---------- Cart item shape ----------

export interface CartItem {
  productId: string;
  companyId: string;
  companyName: string;
  productName: string;
  productSlug: string;
  image?: string;
  variantId: string;
  variantAttributes: Record<string, string>;
  sku: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | {
      type: 'ADD_ITEM';
      payload: {
        product: Product;
        variant: ProductVariant;
        companyName: string;
        quantity: number;
      };
    }
  | { type: 'REMOVE_ITEM'; payload: string } // variantId
  | { type: 'UPDATE_QUANTITY'; payload: { variantId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (
    product: Product,
    variant: ProductVariant,
    companyName: string,
    quantity?: number
  ) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (variantId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function calcTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  let newItems: CartItem[];

  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant, companyName, quantity } = action.payload;
      const existing = state.items.find((i) => i.variantId === variant._id);

      if (existing) {
        newItems = state.items.map((i) =>
          i.variantId === variant._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        const newItem: CartItem = {
          productId: product._id,
          companyId: product.companyId,
          companyName,
          productName: product.name,
          productSlug: product.slug,
          image: product.images[0],
          variantId: variant._id,
          variantAttributes: variant.attributes,
          sku: variant.sku,
          price: variant.price,
          quantity,
        };
        newItems = [...state.items, newItem];
      }
      return { items: newItems, ...calcTotals(newItems) };
    }
    case 'REMOVE_ITEM':
      newItems = state.items.filter((i) => i.variantId !== action.payload);
      return { items: newItems, ...calcTotals(newItems) };
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        newItems = state.items.filter((i) => i.variantId !== action.payload.variantId);
      } else {
        newItems = state.items.map((i) =>
          i.variantId === action.payload.variantId
            ? { ...i, quantity: action.payload.quantity }
            : i
        );
      }
      return { items: newItems, ...calcTotals(newItems) };
    case 'CLEAR_CART':
      return { items: [], totalItems: 0, totalPrice: 0 };
    case 'LOAD_CART':
      return { items: action.payload, ...calcTotals(action.payload) };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('roboexpert_cart_v2');
      if (stored) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('roboexpert_cart_v2', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (
    product: Product,
    variant: ProductVariant,
    companyName: string,
    quantity = 1
  ) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variant, companyName, quantity } });
  };

  const removeItem = (variantId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: variantId });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { variantId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (variantId: string) => {
    return state.items.find((i) => i.variantId === variantId)?.quantity || 0;
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}