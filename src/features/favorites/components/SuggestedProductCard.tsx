import { CARD_BASE_CLASS } from '@/src/shared/ui';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export type SuggestedProduct = {
  id: string;
  title: string;
  price: string;
  image: any;
};

interface SuggestedProductCardProps {
  product: SuggestedProduct;
}

export function SuggestedProductCard({ product }: SuggestedProductCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className={`${CARD_BASE_CLASS} w-[170px] relative mb-2 ml-4 overflow-hidden`}
      onPress={() => router.push({ pathname: '/product-details', params: { id: product.id } })}
    >
      <View className="w-full h-[120px] bg-[#F9F9F9]">
        <View className="w-full h-full items-center justify-center">
          <Image
            source={product.image}
            className="w-[104px] h-[104px]"
            contentFit="contain"
            transition={200}
          />
        </View>
      </View>
      <View className="p-3 items-end">
        <Text
          className="font-tajawal-bold text-brand-subtitle text-[12px] text-right leading-5 min-h-[34px]"
          numberOfLines={2}
        >
          {product.title}
        </Text>
        <Text className="font-tajawal-bold text-brand-primary text-[14px] mt-1">
          {product.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
