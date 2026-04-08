import { Pressable, Text } from 'react-native';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function Button({ label, onPress, disabled = false }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-full px-5 py-4 active:opacity-90 ${
        disabled ? 'bg-[#8EC6A8]' : 'bg-[#1F8A5B]'
      }`}>
      <Text className="text-center text-base font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
