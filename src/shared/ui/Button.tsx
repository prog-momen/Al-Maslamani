import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  className?: string;
  textClassName?: string;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
};

export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  className = '',
  textClassName = '',
  icon,
  iconPosition = 'end',
}: ButtonProps) {
  let bgClass = '';
  let textClass = '';
  let borderClass = '';
  const isDisabled = disabled || loading;

  if (isDisabled) {
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
      disabled={isDisabled}
      className={`rounded-full px-5 py-4 active:opacity-90 flex-row items-center justify-center ${bgClass} ${borderClass} ${className}`}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#84BD00'} />
      ) : (
        <>
          {icon && iconPosition === 'start' ? <View className="mr-2">{icon}</View> : null}
          <Text className={`text-center text-lg font-tajawal-bold ${textClass} ${textClassName}`}>{label}</Text>
          {icon && iconPosition === 'end' ? <View className="ml-2">{icon}</View> : null}
        </>
      )}
    </Pressable>
  );
}
