import { Text } from 'react-native';

import { EmptyState, Header, ScreenWrapper } from '@/src/shared/ui';

export function CategoryBrowseScreen() {
  return (
    <ScreenWrapper>
      <Header title="Category" subtitle="Browse products by category" />
      <EmptyState title="Category list" description="TODO: Implement category filters and sorting." />
      <Text style={{ color: '#6B7280' }}>This screen is prepared for future route expansion.</Text>
    </ScreenWrapper>
  );
}
