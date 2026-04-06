import { Link } from 'expo-router';
import { Text } from 'react-native';

import { Button, Header, ScreenWrapper } from '@/src/shared/ui';

export function ProfileScreen() {
  return (
    <ScreenWrapper>
      <Header title="Profile" subtitle="Manage account settings" />
      <Text>TODO: Display profile details from profiles table.</Text>
      <Link href="/orders/history">Order history</Link>
      <Link href="/static/about">About company</Link>
      <Link href="/static/contact">Contact us</Link>
      <Button label="Sign out" onPress={() => undefined} />
    </ScreenWrapper>
  );
}
