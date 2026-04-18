import { supabase } from '@/src/lib/supabase/client';

const sb = supabase as any;

export const getCartItems = async (userId: string) => {
  const { data, error } = await sb
    .from('cart_items')
    .select(`
      id,
      quantity,
      product:products (
        id,
        name,
        price,
        image_url,
        description
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('getCartItems error:', error);
    throw error;
  }
  return data || [];
};

export const updateQuantity = async (id: string, quantity: number) => {
  const { error } = await sb.from('cart_items').update({ quantity }).eq('id', id);
  if (error) {
    console.error('updateQuantity error:', error);
    throw error;
  }
};

export const removeItem = async (id: string) => {
  const { error } = await sb.from('cart_items').delete().eq('id', id);
  if (error) {
    console.error('removeItem error:', error);
    throw error;
  }
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  const { data, error: selectError } = await sb
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
  
  if (selectError) {
    console.error('addToCart select error:', selectError);
    throw selectError;
  }

  if (data) {
    const { error: updateError } = await sb
        .from('cart_items')
        .update({ quantity: data.quantity + quantity })
        .eq('id', data.id);
    if (updateError) {
        console.error('addToCart update error:', updateError);
        throw updateError;
    }
    return;
  }
  
  const { error: insertError } = await sb.from('cart_items').insert({
    user_id: userId,
    product_id: productId,
    quantity: quantity,
  });

  if (insertError) {
      console.error('addToCart insert error:', insertError);
      throw insertError;
  }
};
