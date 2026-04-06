import { EmptyState, Header, ScreenWrapper } from '@/src/shared/ui';

export function OrderHistoryScreen() {
  return (
    <ScreenWrapper>
      <Header title="Order History" subtitle="Your previous orders" />
      <EmptyState title="No orders yet" description="TODO: Render historical orders list." />
    </ScreenWrapper>
  );
}
