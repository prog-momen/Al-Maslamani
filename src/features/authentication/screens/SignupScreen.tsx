import { Link } from 'expo-router';

import { Button, Header, Input, ScreenWrapper } from '@/src/shared/ui';

export function SignupScreen() {
  return (
    <ScreenWrapper>
      <Header title="Sign Up" subtitle="Create your customer account" />
      <Input label="Full name" placeholder="Your name" />
      <Input label="Email" placeholder="name@example.com" autoCapitalize="none" />
      <Input label="Password" placeholder="********" secureTextEntry />
      <Button label="Create account" onPress={() => undefined} />
      <Link href="/login">Already have an account?</Link>
      {/* TODO: Connect sign-up flow to useRegister hook + Supabase auth service. */}
    </ScreenWrapper>
  );
}
