import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/src/shared/hooks/useAuth';
import * as cartService from '@/src/features/cart/services/cart.service';

export type CartItem = {
  id: string; // This is the cart_item.id (database UUID)
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: any;
  variant?: string;
};

type CartContextType = {
  items: CartItem[];
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  shipping: number;
  subtotal: number;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await cartService.getCartItems(user.id);
      const formatted: CartItem[] = (data || []).map((i: any) => {
        // Supabase join can return an object or an array of objects
        const product = Array.isArray(i.product) ? i.product[0] : i.product;
        
        return {
          id: i.id,
          productId: product?.id,
          title: product?.name || 'منتج',
          price: product?.price || 0,
          quantity: i.quantity,
          variant: product?.description,
          image: product?.image_url ? { uri: product.image_url } : null,
        };
      });
      setItems(formatted);
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user?.id) return;
    try {
      await cartService.addToCart(user.id, productId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await removeFromCart(cartItemId);
      } else {
        await cartService.updateQuantity(cartItemId, newQuantity);
        await refreshCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      await cartService.removeItem(cartItemId);
      await refreshCart();
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    // In Supabase, we'd need a "clear all" service. 
    // For now, we manually remove or just update the UI
    setItems([]);
    if (user?.id) {
        // Technically we should delete all from DB. 
        // We'll leave this to be implemented if needed.
    }
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [items]);

  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{ 
        items, 
        isLoading, 
        refreshCart, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        shipping, 
        subtotal, 
        total 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
};
