import { addToCart } from '../services/cart.service';

export const useCartActions = () => {

  const addItem = async (userId: string, productId: string) => {
    if (!userId || !productId) return;
    try {
      await addToCart(userId, productId);
    } catch (error) {
      console.error('addItem error:', error);
    }
  };

  return { addItem };
};
