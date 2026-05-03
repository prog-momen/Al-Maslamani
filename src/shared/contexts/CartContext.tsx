import * as cartService from '@/src/features/cart/services/cart.service';
import { useRealtimeSignal } from '@/src/shared/contexts/RealtimeContext';
import { useAuth } from '@/src/shared/hooks/useAuth';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const { user, isGuest } = useAuth();
  const cartSignal = useRealtimeSignal('cart');
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user?.id) {
        // Authenticated flow
        const data = await cartService.getCartItems(user.id);
        const formatted: CartItem[] = (data || []).map((i: any) => {
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
      } else {
        // Guest flow
        const localCartRaw = await AsyncStorage.getItem('GUEST_CART');
        const localCart: { productId: string; quantity: number; id: string }[] = localCartRaw ? JSON.parse(localCartRaw) : [];
        
        if (localCart.length > 0) {
          const productIds = localCart.map(i => i.productId);
          const { supabase } = require('@/src/lib/supabase/client');
          const { data: products } = await supabase.from('products').select('*').in('id', productIds);
          
          const formatted: CartItem[] = localCart.map(item => {
            const product = products?.find((p: any) => p.id === item.productId);
            return {
              id: item.id, // Using the local generated ID
              productId: item.productId,
              title: product?.name || 'منتج',
              price: product?.price || 0,
              quantity: item.quantity,
              variant: product?.description,
              image: product?.image_url ? { uri: product.image_url } : null,
            };
          });
          setItems(formatted);
        } else {
          setItems([]);
        }
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart, cartSignal]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (user?.id) {
      await cartService.addToCart(user.id, productId, quantity);
    } else {
      const localCartRaw = await AsyncStorage.getItem('GUEST_CART');
      const localCart: { productId: string; quantity: number; id: string }[] = localCartRaw ? JSON.parse(localCartRaw) : [];
      
      const existingItem = localCart.find(i => i.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        // Generate a random ID for the local cart item
        localCart.push({ id: Math.random().toString(36).substring(7), productId, quantity });
      }
      await AsyncStorage.setItem('GUEST_CART', JSON.stringify(localCart));
    }
    await refreshCart();
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    
    if (user?.id) {
      await cartService.updateQuantity(cartItemId, newQuantity);
    } else {
      const localCartRaw = await AsyncStorage.getItem('GUEST_CART');
      let localCart: { productId: string; quantity: number; id: string }[] = localCartRaw ? JSON.parse(localCartRaw) : [];
      const item = localCart.find(i => i.id === cartItemId);
      if (item) {
        item.quantity = newQuantity;
        await AsyncStorage.setItem('GUEST_CART', JSON.stringify(localCart));
      }
    }
    await refreshCart();
  };

  const removeFromCart = async (cartItemId: string) => {
    if (user?.id) {
      await cartService.removeItem(cartItemId);
    } else {
      const localCartRaw = await AsyncStorage.getItem('GUEST_CART');
      let localCart: { productId: string; quantity: number; id: string }[] = localCartRaw ? JSON.parse(localCartRaw) : [];
      localCart = localCart.filter(i => i.id !== cartItemId);
      await AsyncStorage.setItem('GUEST_CART', JSON.stringify(localCart));
    }
    await refreshCart();
  };

  const clearCart = async () => {
    if (user?.id) {
      // Not implemented in service yet, just UI clear for now
      setItems([]);
    } else {
      await AsyncStorage.removeItem('GUEST_CART');
      setItems([]);
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
