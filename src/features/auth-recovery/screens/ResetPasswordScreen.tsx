import { Button, Header, Input, ScreenWrapper } from '@/src/shared/ui';

export function ResetPasswordScreen() {
  return (
    <ScreenWrapper>
      <Header title="Reset Password" subtitle="Set your new password" />
      <Input label="Email" autoCapitalize="none" />
      <Button label="Send reset link" onPress={() => undefined} />
      {/* TODO: Implement reset password mutation with react-hook-form + Supabase auth. */}
    </ScreenWrapper>
  );
}
