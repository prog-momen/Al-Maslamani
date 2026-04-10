import { Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
};

export function Button({ label, onPress, disabled = false, variant = 'primary', className = '' }: ButtonProps) {
  let bgClass = '';
  let textClass = '';
  let borderClass = '';

  if (disabled) {
    bgClass = 'bg-[#F2F2F2]';
    textClass = 'text-[#AFAFAF]';
    borderClass = 'border-transparent';
  } else if (variant === 'secondary') {
    bgClass = 'bg-white';
    textClass = 'text-brand-primary';
    borderClass = 'border-2 border-brand-primary';
  } else {
    bgClass = 'bg-brand-primary';
    textClass = 'text-white';
    borderClass = 'border-2 border-brand-primary';
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-full px-5 py-4 active:opacity-90 flex-row items-center justify-center ${bgClass} ${borderClass} ${className}`}>
      <Text className={`text-center text-lg font-tajawal-bold ${textClass}`}>{label}</Text>
    </Pressable>
  );
}
