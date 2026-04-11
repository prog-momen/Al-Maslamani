import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const H_PAD = 24;
export const CARD_W = (SCREEN_WIDTH - H_PAD * 2 - 16) / 2;

export const COLORS = {
  surface: '#F2EFE9',
  surfaceCard: '#F7F3EA',
  inputBg: '#EAE8E7',
  white: '#FFFFFF',
  primary: '#67BB28',
  titleDark: '#1B1C1C',
  bodyDark: '#3F4A3C',
  mutedText: 'rgba(63,74,60,0.6)',
  badgeLightBg: '#BDEFBE',
  badgeLightTx: '#426E47',
  promoBadge: '#A63360',
  navInactive: '#3F4A3C',
  cartBadge: '#A63360',
} as const;

export const fontStyle = (weight: 'regular' | 'medium' | 'bold') => ({
  fontFamily:
    weight === 'bold'
      ? 'Tajawal-Bold'
      : weight === 'medium'
      ? 'Tajawal-Medium'
      : 'Tajawal-Regular',
});

export const ALL_LABEL = 'الكل';
export const CAT_NUTS = 'مكسرات';
export const CAT_SNACK = 'سناك';
export const CAT_SEEDS = 'بزورات';
export const CATEGORIES = [ALL_LABEL, CAT_NUTS, CAT_SNACK, CAT_SEEDS];

export const normalizeCategory = (cat: string): string =>
  cat.trim() === 'بزروات' ? 'بزورات' : cat.trim();

export const getBadgeLabel = (category: string): string => {
  if (category === CAT_NUTS) return 'طبيعي 100%';
  if (category === CAT_SNACK) return 'محمص طازج';
  return 'طازج';
};

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  price: number;
  weight: string;
  description: string;
  descriptionAr: string;
  imageUrl: string;
  inStock: boolean;
  isFeatured: boolean;
}