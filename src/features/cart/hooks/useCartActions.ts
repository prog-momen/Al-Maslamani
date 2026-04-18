import { Alert } from 'react-native';
import { useCart } from '@/src/shared/contexts/CartContext';

type AddItemOptions = {
  quantity?: number;
  onGoToCart?: () => void;
  showSuccessPopup?: boolean;
  onSuccess?: () => void;
};

export const useCartActions = () => {
  const { addToCart } = useCart();

  const addItem = async (userId: string, productId: string, options?: AddItemOptions) => {
    if (!userId || !productId) return false;

    const quantity = Math.max(1, Math.floor(options?.quantity ?? 1));
    const showSuccessPopup = options?.showSuccessPopup ?? true;

    try {
      await addToCart(productId, quantity);

      if (options?.onSuccess) {
        options.onSuccess();
      } else if (showSuccessPopup) {
        Alert.alert(
          'تمت الإضافة بنجاح',
          quantity > 1 ? `تمت إضافة ${quantity} قطعة إلى السلة.` : 'تمت إضافة المنتج إلى السلة بنجاح.',
          [
            {
              text: 'اذهب للسلة',
              onPress: options?.onGoToCart,
            },
            {
              text: 'إكمال الشراء',
              style: 'cancel',
            },
          ]
        );
      }

      return true;
    } catch (error) {
      console.error('addItem error:', error);
      Alert.alert('تعذر الإضافة', 'حدث خطأ أثناء إضافة المنتج إلى السلة. حاول مرة أخرى.');
      return false;
    }
  };

  return { addItem };
};
