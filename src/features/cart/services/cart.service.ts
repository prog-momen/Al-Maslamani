import { supabase } from '@/src/lib/supabase/client';

const sb = supabase as any;

export const getCartItems = async (userId: string) => {
  const { data, error } = await sb.from('cart_items').select(`
    id,
    quantity,
    product:products (
      id,
      name,
      price,
      image_url,
      description
    )
    `).eq('user_id', userId);
    
    if (error) {
      console.error('getCartItems error:', error);
      return [];
    }
    return data || [];
  };

export const updateQuantity = async (id: string, quantity: number) => {
  const { error } = await sb.from('cart_items').update({ quantity }).eq('id', id);
  
  if (error) {
    console.error('updateQuantity error:', error);
  }
};

export const removeItem = async (id: string) => {
  const { error } = await sb.from('cart_items').delete().eq('id', id);
  
  if (error) {
    console.error('removeItem error:', error);
  }
};

export const addToCart = async (userId: string, productId: string) => {
  const { data } = await sb.from('cart_items').select('*').eq('user_id', userId).eq('product_id', productId).maybeSingle();
  
  if (data) {
    return await sb.from('cart_items').update({ quantity: data.quantity + 1 }).eq('id', data.id);
  }
  
  return await sb.from('cart_items').insert({
    user_id: userId,
    product_id: productId,
    quantity: 1,
  });
};
