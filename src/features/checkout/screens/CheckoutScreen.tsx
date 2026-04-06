import { Link } from 'expo-router';

import { Button, Header, ScreenWrapper } from '@/src/shared/ui';

export function CheckoutScreen() {
  return (
    <ScreenWrapper>
      <Header title="Checkout" subtitle="Payment and order summary" />
      <Link href="/checkout/address">Manage shipping address</Link>
      <Button label="Place order" onPress={() => undefined} />
      {/* TODO: Integrate payment + create order mutation. */}
    </ScreenWrapper>
  );
}
