import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const CartItemCard = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: {
    id: string;
    title: string;
    price: number;
    image: any;
    quantity: number;
  };
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}><Image source={item.image} style={styles.image} contentFit="contain" />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.titleBox}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.weight}>400 غم</Text>
        </View>
        <View style={styles.quantityBox}><TouchableOpacity onPress={() => onIncrease(item.id)}><Ionicons name="add" size={20} color="#67BB28" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>

          <TouchableOpacity onPress={() => onDecrease(item.id)}><Ionicons name="remove" size={20} color="#67BB28" /></TouchableOpacity>
        </View>
      </View>

      <View style={styles.rightBox}>
        <TouchableOpacity onPress={() => onRemove(item.id)}><Ionicons name="close" size={22} color="#9A9A9A" /></TouchableOpacity>

        <Text style={styles.price}>{item.price} ₪</Text>
      </View>

    </View>


  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F3EA',
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
    height: 152,
  },
  imageContainer: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 110,
    height: 110,
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titleBox: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weight: {
    fontSize: 14,
    color: '#67BB28',
    marginBottom: 12,
  },
  quantityBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#E9E9E9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 16,
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightBox: {
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#67BB28',
    marginTop: 30,
  },
});
