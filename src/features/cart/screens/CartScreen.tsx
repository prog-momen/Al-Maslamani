import { Button, EmptyState, Header, ScreenWrapper } from '@/src/shared/ui';

export function CartScreen() {
  return (
    <ScreenWrapper>
      <Header title="Cart" subtitle="Review your selected items" />
      <EmptyState title="Your cart is empty" description="TODO: Render cart items grouped by product." />
      <Button label="Go to checkout" onPress={() => undefined} />
    </ScreenWrapper>
  );
}
