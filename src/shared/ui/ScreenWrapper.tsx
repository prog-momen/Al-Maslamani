import { PropsWithChildren } from 'react';
import { ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenWrapperProps = PropsWithChildren<{
  scroll?: boolean;
  style?: ViewStyle;
}>;

export function ScreenWrapper({ children, scroll = false, style }: ScreenWrapperProps) {
  if (scroll) {
    return (
      <SafeAreaView className="flex-1 bg-[#F7F1E8]">
        <ScrollView contentContainerStyle={[{ flexGrow: 1, padding: 20, gap: 16 }, style]}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F1E8]">
      <ScrollView contentContainerStyle={[{ flexGrow: 1, padding: 20, gap: 16 }, style]}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
