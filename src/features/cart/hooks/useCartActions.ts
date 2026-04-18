import { Alert } from 'react-native';
import { addToCart } from '../services/cart.service';

type AddItemOptions = {
  quantity?: number;
  onGoToCart?: () => void;
  showSuccessPopup?: boolean;
  /** Called when the item is added successfully — use this to show a custom modal */
  onSuccess?: () => void;
};

export const useCartActions = () => {

  const addItem = async (userId: string, productId: string, options?: AddItemOptions) => {
    if (!userId || !productId) return false;

    const quantity = Math.max(1, Math.floor(options?.quantity ?? 1));
    const showSuccessPopup = options?.showSuccessPopup ?? true;

    try {
      for (let i = 0; i < quantity; i += 1) {
        await addToCart(userId, productId);
      }

      if (options?.onSuccess) {
        // Caller handles the success UI (custom modal)
        options.onSuccess();
      } else if (showSuccessPopup) {
        // Fallback: native alert
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
