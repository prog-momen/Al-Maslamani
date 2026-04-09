import { Image } from 'expo-image';
import { Text, View } from 'react-native';

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
  return (
    <View className="bg-white rounded-[28px] p-4 w-[170px] relative shadow-sm mb-2 ml-4">
      <View className="w-full h-[120px] items-center justify-center mb-1">
        <Image
          source={product.image}
          className="w-full h-full max-w-[130px]"
          contentFit="contain"
          transition={200}
        />
      </View>
      <View className="items-end mt-2">
        <Text
          className="font-tajawal-bold text-brand-subtitle text-[13px] text-right leading-5 min-h-[38px]"
          numberOfLines={2}
        >
          {product.title}
        </Text>
        <Text className="font-tajawal-bold text-brand-primary text-[15px] mt-1">
          {product.price}
        </Text>
      </View>
    </View>
  );
}
