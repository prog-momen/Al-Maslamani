import { Image as ExpoImage } from 'expo-image';
import { cssInterop } from 'nativewind';

// Ensure NativeWind className is mapped to the style prop for expo-image.
cssInterop(ExpoImage, {
  className: 'style',
});
