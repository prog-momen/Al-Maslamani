import { Header, ScreenWrapper } from '@/src/shared/ui';

export function OrderTrackingScreen() {
  return (
    <ScreenWrapper>
      <Header title="Order Tracking" subtitle="Track delivery status" />
      {/* TODO: Render timeline from orders + order_status_history tables. */}
    </ScreenWrapper>
  );
}
