import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { Button, Card, Header, ScreenWrapper } from '@/src/shared/ui';

export function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenWrapper>
      <Header title="Product Details" subtitle={`Product #${id ?? 'N/A'}`} />
      <Card>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>TODO: Load selected product data by id.</Text>
      </Card>
      <Button label="Add to cart" onPress={() => undefined} />
    </ScreenWrapper>
  );
}
