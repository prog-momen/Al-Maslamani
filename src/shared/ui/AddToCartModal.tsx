import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Button } from './Button';

type AddToCartModalProps = {
  visible: boolean;
  productName?: string;
  quantity?: number;
  onContinueShopping: () => void;
  onGoToCart: () => void;
};

export function AddToCartModal({
  visible,
  productName,
  quantity = 1,
  onContinueShopping,
  onGoToCart,
}: AddToCartModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 200,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const itemLabel =
    quantity > 1
      ? `تمت إضافة ${quantity} قطع إلى السلة`
      : 'تمت إضافة المنتج إلى السلة';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onContinueShopping}
    >
      {/* Backdrop */}
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
        onPress={onContinueShopping}
      >
        {/* Card — stops tap from closing when pressing inside */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            width: '100%',
          }}
        >
          <Pressable
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 28,
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 28,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            {/* Success Icon Circle */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#EDF7E4',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                borderWidth: 2,
                borderColor: '#C7E9A8',
              }}
            >
              <Ionicons name="checkmark-circle" size={40} color="#67BB28" />
            </View>

            {/* Title */}
            <Text
              style={{
                fontFamily: 'Tajawal_700Bold',
                fontSize: 22,
                color: '#1B1C1C',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              تمت الإضافة بنجاح! 🎉
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontFamily: 'Tajawal_500Medium',
                fontSize: 15,
                color: '#6B7280',
                textAlign: 'center',
                marginBottom: 4,
                paddingHorizontal: 8,
              }}
            >
              {itemLabel}
            </Text>

            {productName ? (
              <Text
                style={{
                  fontFamily: 'Tajawal_700Bold',
                  fontSize: 16,
                  color: '#67BB28',
                  textAlign: 'center',
                  marginBottom: 28,
                }}
              >
                {productName}
              </Text>
            ) : (
              <View style={{ marginBottom: 28 }} />
            )}

            {/* Divider */}
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: '#F0F0F0',
                marginBottom: 20,
              }}
            />

            {/* Buttons */}
            <View style={{ width: '100%', gap: 12 }}>
              {/* Go to Cart — Primary */}
              <Button
                label="الذهاب للسلة"
                variant="primary"
                onPress={onGoToCart}
                icon={<Ionicons name="cart" size={20} color="#fff" />}
                iconPosition="end"
              />

              {/* Continue Shopping — Secondary */}
              <Button
                label="إكمال التسوق"
                variant="secondary"
                onPress={onContinueShopping}
              />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
