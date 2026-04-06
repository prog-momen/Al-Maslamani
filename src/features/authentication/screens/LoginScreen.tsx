import { Link } from 'expo-router';
import { Text } from 'react-native';

import { useLogin } from '@/src/features/authentication/hooks/useLogin';
import { Button, Header, Input, ScreenWrapper } from '@/src/shared/ui';

export function LoginScreen() {
  const { email, setEmail, password, setPassword, onSubmit } = useLogin();

  return (
    <ScreenWrapper>
      <Header title="Login" subtitle="Sign in to continue ordering" />
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button label="Login" onPress={onSubmit} />
      <Link href="/signup">Create account</Link>
      <Link href="/reset-password">Forgot password?</Link>
      <Text style={{ color: '#6B7280' }}>TODO: Replace local state with react-hook-form validation.</Text>
    </ScreenWrapper>
  );
}
