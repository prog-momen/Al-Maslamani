import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

export type FavoriteProduct = {
  id: string;
  title: string;
  price: string;
  image: any;
  isFavorite: boolean;
  tag?: {
    text: string;
    bgColor: string;
    textColor: string;
  };
};

interface FavoriteProductCardProps {
  product: FavoriteProduct;
  onToggleFavorite?: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

export function FavoriteProductCard({ product, onToggleFavorite, onAddToCart }: FavoriteProductCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => router.push('/product-details')}
      className="bg-white rounded-[24px] relative shadow-sm h-[320px] overflow-hidden mb-4"
    >
      {/* Heart Icon (Top Left) */}
      <TouchableOpacity 
        className="absolute top-4 left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
        onPress={() => onToggleFavorite?.(product.id)}
      >
        <Ionicons name={product.isFavorite ? "heart" : "heart-outline"} size={22} color="#67BB28" />
      </TouchableOpacity>

      {/* Product Image */}
      <View className="w-full h-[180px] bg-[#F9F9F9]">
        <Image
          source={product.image}
          className="w-full h-full"
          contentFit="cover"
          transition={200}
        />
      </View>

      {/* Bottom Section */}
      <View className="p-4 flex-row justify-between items-end h-[140px]">
        {/* Left Side: Tag and Cart Button */}
        <View className="items-start justify-between h-full py-1">
          {product.tag ? (
            <View className={`${product.tag.bgColor} px-3 py-1.5 rounded-full`}>
              <Text className={`${product.tag.textColor} font-tajawal-bold text-[11px]`}>
                {product.tag.text}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <TouchableOpacity 
             className="w-10 h-10 bg-brand-primary rounded-full items-center justify-center shadow-sm"
             onPress={() => onAddToCart?.(product.id)}
          >
             <Ionicons name="cart" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Right Side: Title and Price */}
        <View className="items-end justify-center h-full py-2">
          <Text className="font-tajawal-bold text-brand-subtitle text-[16px] text-right leading-6 mb-2" numberOfLines={2}>
            {product.title}
          </Text>
          <Text className="font-tajawal-bold text-brand-primary text-[18px]">
            {product.price} 
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
