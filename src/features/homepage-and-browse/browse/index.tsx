import productsData from '@/assets/data/products.json';
import { useCart } from '@/src/shared/contexts/CartContext';
import { Image } from 'expo-image';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  I18nManager,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 24;
const CARD_W = (SCREEN_WIDTH - H_PAD * 2 - 16) / 2;
const INITIAL_LOAD_COUNT = 10;
const LOAD_MORE_COUNT = 8;

const COLORS = {
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
  pinkBadge: '#F26F9D',
  pinkBadgeText: '#690034',
  navInactive: '#3F4A3C',
  cartBadge: '#A63360',
  pillBorder: 'rgba(190, 202, 185, 0.1)',
  backButtonBg: '#EAE8E7',
  loadMoreBg: '#E4E2E1',
};

const fontStyle = (weight: 'regular' | 'medium' | 'bold' | 'black') => ({
  fontFamily:
    weight === 'black' ? 'Tajawal-Black' :
    weight === 'bold'  ? 'Tajawal-Bold'  :
    weight === 'medium'? 'Tajawal-Medium': 'Tajawal-Regular',
});

const ALL_LABEL = 'الكل';
const CAT_NUTS  = 'مكسرات';
const CAT_SNACK = 'سناك';
const CAT_SEEDS = 'بزورات';
const CATEGORIES = [ALL_LABEL, CAT_NUTS, CAT_SNACK, CAT_SEEDS];

const normalizeCategory = (cat: string): string =>
  cat.trim() === 'بزروات' ? 'بزورات' : cat.trim();

const getBadgeLabel = (category: string): string => {
  if (category === CAT_NUTS)  return 'طبيعي 100%';
  if (category === CAT_SNACK) return 'محمص طازج';
  return 'طازج';
};

const getBadgeStyle = (category: string) => {
  if (category === CAT_NUTS) return { bg: COLORS.badgeLightBg, text: COLORS.badgeLightTx };
  return { bg: COLORS.pinkBadge, text: COLORS.pinkBadgeText };
};

interface Product {
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

// ─── Flying dot type ──────────────────────────────────────────────────────────
interface FlyingDot {
  id: number;
  startX: number;
  startY: number;
  anim: Animated.ValueXY;
  opacity: Animated.Value;
}

// ─── Add / Quantity Button ────────────────────────────────────────────────────
// Defined outside Browse so it never remounts on parent re-renders.
interface AddBtnProps {
  product: Product;
  onAddWithPosition: (productId: string, x: number, y: number) => void;
}

const AddBtn = React.memo(({ product, onAddWithPosition }: AddBtnProps) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const qty = cartItems.find((i) => i.id === product.id)?.quantity ?? 0;
  const btnRef = useRef<View>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.25, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleAdd = () => {
    addToCart({
      id: product.id,
      nameAr: product.nameAr,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    bounce();
    btnRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
      onAddWithPosition(product.id, pageX + 20, pageY + 20);
    });
  };

  const handleDecrement = () => {
    updateQuantity(product.id, qty - 1);
    bounce();
  };

  if (qty === 0) {
    return (
      <View ref={btnRef} collapsable={false}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={handleAdd}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View ref={btnRef} collapsable={false}>
      <Animated.View style={[styles.stepper, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity style={styles.stepperBtn} activeOpacity={0.7} onPress={handleDecrement}>
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperQty}>{qty}</Text>
        <TouchableOpacity style={styles.stepperBtn} activeOpacity={0.7} onPress={handleAdd}>
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function Browse() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const [allProducts, setAllProducts]       = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(params.category || ALL_LABEL);
  const [activeNav, setActiveNav]           = useState('categories');
  const [visibleCount, setVisibleCount]     = useState(INITIAL_LOAD_COUNT);
  const [searchQuery, setSearchQuery]       = useState('');
  const [isSearching, setIsSearching]       = useState(false);
  const [flyingDots, setFlyingDots]         = useState<FlyingDot[]>([]);

  const dotCounter  = useRef(0);
  const cartIconRef = useRef<View>(null);

  // NAV_ITEMS with live cartCount badge
  const NAV_ITEMS = [
    { key: 'home',       label: 'الرئيسية', icon: '⌂',  route: '/homepage'  },
    { key: 'categories', label: 'الفئات',   icon: '⊞',  route: '/browse'    },
    { key: 'cart',       label: 'السلة',    icon: '🛒', route: '/cart',     badge: cartCount },
    { key: 'favorites',  label: 'المفضلة',  icon: '♥',  route: '/favorites' },
    { key: 'account',    label: 'حسابي',    icon: '👤', route: '/account'   },
  ];

  useEffect(() => {
    const normalized = (productsData.products as Product[]).map((p) => ({
      ...p,
      category: normalizeCategory(p.category),
    }));
    setAllProducts(normalized);
  }, []);

  useEffect(() => {
    if (params.category) setSelectedCategory(params.category);
  }, [params.category]);

  useEffect(() => {
  const searchParam = params.search;
  if (searchParam && typeof searchParam === 'string') {
    setSearchQuery(decodeURIComponent(searchParam));
    setIsSearching(true);
  }
}, [params.search]);

  const filteredProducts = useMemo(() => {
    let list = selectedCategory === ALL_LABEL
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      list = list.filter(
        (p) =>
          p.nameAr.includes(q) ||
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.descriptionAr.includes(q) ||
          p.description.toLowerCase().includes(q.toLowerCase()),
      );
    }
    return list;
  }, [selectedCategory, allProducts, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () =>
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filteredProducts.length));

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(INITIAL_LOAD_COUNT);
  };

  // ── Flying dot launcher ───────────────────────────────────────────────────
  const launchFlyingDot = useCallback(
    (_productId: string, startX: number, startY: number) => {
      cartIconRef.current?.measure((_x, _y, _w, _h, cartPageX, cartPageY) => {
        const id = dotCounter.current++;
        const anim    = new Animated.ValueXY({ x: 0, y: 0 });
        const opacity = new Animated.Value(1);

        setFlyingDots((prev) => [...prev, { id, startX, startY, anim, opacity }]);

        Animated.parallel([
          Animated.timing(anim, {
            toValue: { x: cartPageX - startX, y: cartPageY - startY },
            duration: 550,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(350),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]),
        ]).start(() => {
          setFlyingDots((prev) => prev.filter((d) => d.id !== id));
        });
      });
    },
    [],
  );

  // ── Bottom nav ────────────────────────────────────────────────────────────
  const BottomNav = () => (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const active = activeNav === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => {
              setActiveNav(item.key);
              router.push(item.route as Href);
            }}
            activeOpacity={0.75}
          >
            {item.key === 'cart' ? (
              <View ref={cartIconRef} collapsable={false} style={styles.navIconWrap}>
                <Text style={[styles.navIcon, active && styles.navIconActive]}>{item.icon}</Text>
                {item.badge ? (
                  <View style={styles.navCartBadge}>
                    <Text style={styles.navCartBadgeText}>{item.badge}</Text>
                  </View>
                ) : null}
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </View>
            ) : active ? (
              <View style={styles.navActivePill}>
                <Text style={styles.navActivePillIcon}>{item.icon}</Text>
                <Text style={styles.navActivePillLabel}>{item.label}</Text>
              </View>
            ) : (
              <View style={styles.navIconWrap}>
                <Text style={styles.navIcon}>{item.icon}</Text>
                <Text style={styles.navLabel}>{item.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── Top bar ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>

        {/* Logo in the centre */}
        <Image
          source={require('@/assets/images/logo-transparent.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            setIsSearching((v) => !v);
            if (isSearching) setSearchQuery('');
          }}
        >
          <Text style={styles.headerIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search bar (shown when tapping 🔍) ── */}
      {isSearching && (
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="ابحث عن منتج..."
              placeholderTextColor={COLORS.mutedText}
              style={styles.searchInput}
              textAlign="right"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery !== '' && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearch}
              >
                <Text style={{ fontSize: 18, color: COLORS.mutedText }}>✕</Text>
              </TouchableOpacity>
            )}
            <View style={styles.searchIconWrap}>
              <Text style={{ fontSize: 16 }}>🔍</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title + category pills ── */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <View style={styles.filterButtons}>
              <TouchableOpacity style={styles.filterBtn}>
                <Text style={styles.filterIcon}>⊡</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterBtn}>
                <Text style={styles.filterIcon}>↓</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={styles.selectedCategoryLabel}>المجموعة المختارة</Text>
              <Text style={styles.pageTitle}>الفئات</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillScroll}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => handleCategoryChange(cat)}
                  style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.pillText,
                      active ? styles.pillTextActive : styles.pillTextInactive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Search result count ── */}
        {searchQuery.trim() !== '' && (
          <View style={styles.searchResultRow}>
            <Text style={styles.searchResultText}>
              {filteredProducts.length > 0
                ? `${filteredProducts.length} نتيجة لـ "${searchQuery}"`
                : `لا توجد نتائج لـ "${searchQuery}"`}
            </Text>
          </View>
        )}

        {/* ── Product grid ── */}
        <View style={styles.grid}>
          {visibleProducts.map((product) => {
            const badgeStyle = getBadgeStyle(product.category);
            return (
              <TouchableOpacity
                key={product.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => router.push(`/product/${product.id}` as Href)}
              >
                <View style={styles.cardImgWrap}>
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.cardImg}
                    contentFit="cover"
                    transition={300}
                  />
                  <View style={[styles.cardBadge, { backgroundColor: badgeStyle.bg }]}>
                    <Text style={[styles.cardBadgeText, { color: badgeStyle.text }]}>
                      {getBadgeLabel(product.category)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {product.nameAr}
                  </Text>
                  <View style={styles.cardFooter}>
                    <AddBtn product={product} onAddWithPosition={launchFlyingDot} />
                    <Text style={styles.cardPrice}>₪{product.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Empty state ── */}
        {filteredProducts.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>لا توجد منتجات مطابقة</Text>
          </View>
        )}

        {hasMore && (
          <TouchableOpacity
            style={styles.loadMoreBtn}
            onPress={handleLoadMore}
            activeOpacity={0.8}
          >
            <Text style={styles.loadMoreIcon}>↓</Text>
            <Text style={styles.loadMoreText}>عرض المزيد</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav />

      {/* ── Flying dots ── */}
      {flyingDots.map((dot) => (
        <Animated.View
          key={dot.id}
          pointerEvents="none"
          style={[
            styles.flyingDot,
            {
              left: dot.startX,
              top: dot.startY,
              opacity: dot.opacity,
              transform: dot.anim.getTranslateTransform(),
            },
          ]}
        />
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
  },
  headerBtn: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: COLORS.backButtonBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: { fontSize: 20, color: COLORS.bodyDark },
  logo: { width: 250, height: 150},

  // ── Search ──
  searchWrap: { paddingHorizontal: H_PAD, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 9999,
    paddingLeft: 16,
    paddingRight: 48,
    height: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.bodyDark,
    ...fontStyle('regular'),
    padding: 0,
  },
  searchIconWrap: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  clearSearch: { position: 'absolute', left: 50, padding: 8 },

  searchResultRow: { paddingHorizontal: H_PAD, marginBottom: 12 },
  searchResultText: {
    fontSize: 13,
    color: COLORS.mutedText,
    ...fontStyle('regular'),
    textAlign: 'right',
  },

  // ── Title section ──
  titleSection: { paddingHorizontal: H_PAD, marginBottom: 32 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  filterButtons: { flexDirection: 'row', gap: 8 },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.backButtonBg,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: { fontSize: 18, color: COLORS.bodyDark },
  titleTextContainer: { alignItems: 'flex-end' },
  selectedCategoryLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1.4,
    color: COLORS.primary,
    ...fontStyle('bold'),
    textAlign: 'right',
  },
  pageTitle: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.9,
    color: COLORS.titleDark,
    ...fontStyle('black'),
    textAlign: 'right',
  },

  // ── Pills ──
  pillScroll: { flexDirection: 'row', gap: 12 },
  pill: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.pillBorder,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#006E1C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  pillInactive: { backgroundColor: COLORS.white },
  pillText: { fontSize: 16, lineHeight: 24, ...fontStyle('medium'), textAlign: 'center' },
  pillTextActive:   { color: COLORS.white,     ...fontStyle('bold') },
  pillTextInactive: { color: COLORS.bodyDark },

  // ── Grid & cards ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: H_PAD,
    gap: 14,
  },
  card: {
    width: CARD_W,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 4,
  },
  cardImgWrap: { width: '100%', aspectRatio: 1, backgroundColor: COLORS.surfaceCard },
  cardImg: { width: '100%', height: '100%' },
  cardBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  cardBadgeText: {
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: -0.5,
    ...fontStyle('bold'),
    textAlign: 'right',
  },
  cardBody: { padding: 16, gap: 8 },
  cardName: {
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.titleDark,
    ...fontStyle('bold'),
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardPrice: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.primary,
    ...fontStyle('black'),
    textAlign: 'right',
  },

  // ── Add button ──
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { fontSize: 24, color: COLORS.white, lineHeight: 28 },

  // ── Quantity stepper ──
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
    height: 40,
    paddingHorizontal: 4,
    gap: 2,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 18, color: COLORS.white, lineHeight: 22, marginTop: -1 },
  stepperQty: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 15,
    color: COLORS.white,
    ...fontStyle('bold'),
  },

  // ── Empty state ──
  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontSize: 16,
    color: COLORS.mutedText,
    ...fontStyle('medium'),
    textAlign: 'center',
  },

  // ── Load more ──
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 24,
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: COLORS.loadMoreBg,
    borderRadius: 9999,
    gap: 8,
  },
  loadMoreIcon: { fontSize: 12, color: COLORS.bodyDark },
  loadMoreText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.bodyDark,
    ...fontStyle('bold'),
    textAlign: 'center',
  },

  // ── Bottom nav ──
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceCard,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 6,
    shadowColor: '#3F4A3C',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 12,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIconWrap: { alignItems: 'center', gap: 2 },
  navIcon:       { fontSize: 18, color: COLORS.navInactive },
  navIconActive: { color: COLORS.primary },
  navLabel:       { fontSize: 10, lineHeight: 15, color: COLORS.navInactive, ...fontStyle('medium') },
  navLabelActive: { color: COLORS.primary },

  navCartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 15,
    height: 15,
    borderRadius: 9999,
    backgroundColor: COLORS.cartBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCartBadgeText: { fontSize: 9, color: '#F7F3EA', ...fontStyle('regular') },

  navActivePill: {
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    gap: 2,
  },
  navActivePillIcon:  { fontSize: 15, color: COLORS.surfaceCard },
  navActivePillLabel: { fontSize: 10, color: COLORS.surfaceCard, ...fontStyle('medium') },

  // ── Flying dot ──
  flyingDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    zIndex: 9999,
  },
});