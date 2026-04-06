import { Button, Header, Input, ScreenWrapper } from '@/src/shared/ui';

export function AddressScreen() {
  return (
    <ScreenWrapper>
      <Header title="Address" subtitle="Shipping and billing address" />
      <Input label="Label" placeholder="Home / Work" />
      <Input label="City" />
      <Input label="Street" />
      <Input label="Phone" keyboardType="phone-pad" />
      <Button label="Save address" onPress={() => undefined} />
      {/* TODO: Connect this form to useForm + addresses mutation. */}
    </ScreenWrapper>
  );
}
