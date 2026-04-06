import { Header, ScreenWrapper } from '@/src/shared/ui';

export function OrderConfirmationScreen() {
  return (
    <ScreenWrapper>
      <Header title="Order Confirmation" subtitle="Thank you, your order is placed" />
      {/* TODO: Show order number and summary after checkout mutation completes. */}
    </ScreenWrapper>
  );
}
