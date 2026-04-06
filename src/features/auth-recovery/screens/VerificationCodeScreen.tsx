import { Button, Header, Input, ScreenWrapper } from '@/src/shared/ui';

export function VerificationCodeScreen() {
  return (
    <ScreenWrapper>
      <Header title="Verification Code" subtitle="Enter the code sent to your email" />
      <Input label="Code" keyboardType="number-pad" />
      <Button label="Verify" onPress={() => undefined} />
      {/* TODO: Connect verification code check with Supabase auth recovery flow. */}
    </ScreenWrapper>
  );
}
