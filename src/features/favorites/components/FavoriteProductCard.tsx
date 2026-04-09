import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

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
  return (
    <View className="bg-white rounded-[32px] p-5 relative shadow-sm h-[340px] overflow-hidden mb-4">
      {/* Heart Icon (Top Left) */}
      <TouchableOpacity 
        className="absolute top-5 left-5 z-10 w-10 h-10 items-center justify-center"
        onPress={() => onToggleFavorite?.(product.id)}
      >
        <Ionicons name={product.isFavorite ? "heart" : "heart-outline"} size={26} color="#DE3C4B" />
      </TouchableOpacity>

      {/* Product Image */}
      <View className="w-full h-[210px] items-center justify-center mt-2">
        <Image
          source={product.image}
          className="w-full h-full max-w-[260px]"
          contentFit="contain"
          transition={200}
        />
      </View>

      {/* Bottom Section */}
      <View className="absolute bottom-5 left-5 right-5 flex-row justify-between items-end">
        {/* Left Side: Cart Button and Tag */}
        <View className="items-start">
          {product.tag && (
            <View className={`${product.tag.bgColor} px-3 py-1.5 rounded-full mb-3`}>
              <Text className={`${product.tag.textColor} font-tajawal-bold text-[11px]`}>
                {product.tag.text}
              </Text>
            </View>
          )}
          <TouchableOpacity 
             className="w-[38px] h-[38px] bg-brand-primary rounded-full items-center justify-center shadow-sm"
             onPress={() => onAddToCart?.(product.id)}
          >
            <Ionicons name="cart" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Right Side: Title and Price */}
        <View className="items-end pb-1">
          <Text className="font-tajawal-bold text-brand-subtitle text-[15px] text-right leading-6" numberOfLines={2}>
            {product.title}
          </Text>
          <Text className="font-tajawal-bold text-brand-primary text-lg mt-2">
            {product.price}
          </Text>
        </View>
      </View>
    </View>
  );
}
