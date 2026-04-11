import { Text, View, Pressable } from 'react-native';

export default function HomeRoute() {
  return (
    <View className="flex-1 items-center justify-center bg-[#F7F1E8] px-6">
      <Text className="text-center text-2xl font-bold text-[#173A2E]">الصفحة الرئيسية</Text>
      <Text className="mt-2 text-center text-base leading-7 text-[#61756C]">
        TODO: سيتم توصيل هذا المسار لاحقًا مع محتوى الصفحة الرئيسية بعد إكمال الدخول.
      </Text>
      
      <Pressable 
        className="mt-8 bg-[#67BB28] px-6 py-3 rounded-full"
        onPress={() => {
          // @ts-ignore
          import('expo-router').then(m => m.router.push('/profile'));
        }}
      >
        <Text className="text-white font-bold text-lg">الذهاب إلى الملف الشخصي (Profile)</Text>
      </Pressable>
    </View>
  );
}