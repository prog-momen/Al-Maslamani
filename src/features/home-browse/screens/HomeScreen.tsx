import { Link } from 'expo-router';
import { Text } from 'react-native';

import { useProducts } from '@/src/features/home-browse/hooks/useProducts';
import { Card, Header, ScreenWrapper } from '@/src/shared/ui';

export function HomeScreen() {
  const { products } = useProducts();

  return (
    <ScreenWrapper>
      <Header title="Home" subtitle="Browse categories and featured products" />
      {products.slice(0, 4).map((product) => (
        <Card key={product.id}>
          <Text style={{ fontWeight: '600', fontSize: 16 }}>{product.name}</Text>
          <Text>{product.price.toFixed(2)} SAR</Text>
          <Link href={`/product/${product.id}`}>View details</Link>
        </Card>
      ))}
      <Text style={{ color: '#6B7280' }}>TODO: Add categories carousel and promotions.</Text>
    </ScreenWrapper>
  );
}
