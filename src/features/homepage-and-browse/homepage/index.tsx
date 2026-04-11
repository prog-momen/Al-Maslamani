import productsData from '@/assets/data/products.json';
import { useCart } from '@/src/shared/contexts/CartContext';
import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  I18nManager,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ALL_LABEL,
  CARD_W,
  CATEGORIES,
  COLORS,
  fontStyle,
  getBadgeLabel,
  normalizeCategory,
  Product,
} from './constants';
import { styles } from './styles';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Flying dot type ──────────────────────────────────────────────────────────
interface FlyingDot {
  id: number;
  startX: number;
  startY: number;
  anim: Animated.ValueXY;
  opacity: Animated.Value;
}

// ─── Add / Quantity Button ────────────────────────────────────────────────────
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
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
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
      onAddWithPosition(product.id, pageX + 16, pageY + 16);
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

// ─── Small shared components ──────────────────────────────────────────────────
const HeartBtn = () => (
  <TouchableOpacity style={styles.heartBtn} activeOpacity={0.8}>
    <Text style={styles.heartIcon}>♥</Text>
  </TouchableOpacity>
);

const GreenBadge = ({ label }: { label: string }) => (
  <View style={styles.greenBadge}>
    <Text style={styles.greenBadgeText}>{label}</Text>
  </View>
);

// ─── Side Menu Component ─────────────────────────────────────────────────────
const SideMenu = ({ 
  isVisible, 
  onClose, 
  router 
}: { 
  isVisible: boolean; 
  onClose: () => void; 
  router: any;
}) => {
  const menuItems = [
    { icon: '⌂', label: 'الرئيسية', route: '/homepage' },
    { icon: '🛒', label: 'السلة', route: '/cart' },
    { icon: '♥', label: 'المفضلة', route: '/favorites' },
    { icon: '👤', label: 'حسابي', route: '/account' },
    { icon: '📞', label: 'اتصل بنا', route: '/contact' },
    { icon: '⚙️', label: 'الإعدادات', route: '/settings' },
  ];

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={sideMenuStyles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                sideMenuStyles.menu,
                { transform: [{ translateX: slideAnim }] }
              ]}
            >
              <View style={sideMenuStyles.header}>
                <Image
                  source={require('@/assets/images/logo-transparent.png')}
                  style={sideMenuStyles.logo}
                  contentFit="contain"
                />
                <TouchableOpacity onPress={onClose} style={sideMenuStyles.closeBtn}>
                  <Text style={sideMenuStyles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={sideMenuStyles.menuItems}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={sideMenuStyles.menuItem}
                    onPress={() => {
                      onClose();
                      router.push(item.route as Href);
                    }}
                  >
                    <Text style={sideMenuStyles.menuIcon}>{item.icon}</Text>
                    <Text style={sideMenuStyles.menuLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function Homepage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(ALL_LABEL);
  const [activeNav, setActiveNav] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [flyingDots, setFlyingDots] = useState<FlyingDot[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const router = useRouter();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const dotCounter = useRef(0);
  const cartIconRef = useRef<View>(null);

  const NAV_ITEMS = [
    { key: 'home',       label: 'الرئيسية', icon: '⌂',  route: '/homepage'  },
    { key: 'categories', label: 'الفئات',   icon: '⊞',  route: '/browse'    },
    { key: 'cart',       label: 'السلة',    icon: '🛒', route: '/cart',     badge: cartCount },
    { key: 'favorites',  label: 'المفضلة',  icon: '♥',  route: '/favorites' },
    { key: 'account',    label: 'حسابي',    icon: '👤', route: '/account', color: '#3F4A3C', fontSize: 18  },
  ];

  useEffect(() => {
    const normalized = (productsData.products as Product[]).map((p) => ({
      ...p,
      category: normalizeCategory(p.category),
    }));
    setAllProducts(normalized);
    setFeaturedProducts(normalized.filter((p) => p.isFeatured));
  }, []);

  const gridProducts = useMemo(() => {
    const nonFeatured = allProducts.filter((p) => !p.isFeatured);
    if (selectedCategory === ALL_LABEL) return nonFeatured;
    return nonFeatured.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, allProducts]);

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return gridProducts;
    return gridProducts.filter(
      (p) => p.nameAr.includes(searchQuery) || p.descriptionAr.includes(searchQuery),
    );
  }, [gridProducts, searchQuery]);

  // ── Handle search submit ───────────────────────────────────────────────────
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setIsSearching(false);
      router.push(`/browse?search=${encodeURIComponent(searchQuery)}` as Href);
    }
  };

  // ── Flying dot launcher ───────────────────────────────────────────────────
  const launchFlyingDot = useCallback(
    (_productId: string, startX: number, startY: number) => {
      cartIconRef.current?.measure((_x, _y, _w, _h, cartPageX, cartPageY) => {
        const id = dotCounter.current++;
        const anim = new Animated.ValueXY({ x: 0, y: 0 });
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

  const SectionHeader = ({ title, action }: { title: string; action: string }) => (
    <View style={styles.sectionHeader}>
      <TouchableOpacity onPress={() => router.push('/browse')}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const ProductCard = ({
    product,
    width,
    imgH,
  }: {
    product: Product;
    width: number;
    imgH: number;
  }) => (
    <TouchableOpacity 
      style={[styles.card, { width }]} 
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${product.id}` as Href)}
    >
      <View style={[styles.cardImgWrap, { height: imgH }]}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.cardImg}
          contentFit="cover"
          transition={300}
        />
        <HeartBtn />
        <GreenBadge label={getBadgeLabel(product.category)} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardWeight}>{product.weight}</Text>
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
              router.push(item.route as any);
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
            ) : item.key === 'home' && active ? (
              <View style={styles.navActivePill}>
                <Text style={styles.navActivePillIcon}>{item.icon}</Text>
                <Text style={styles.navActivePillLabel}>{item.label}</Text>
              </View>
            ) : (
              <View style={styles.navIconWrap}>
                <Text style={[styles.navIcon, active && styles.navIconActive]}>{item.icon}</Text>
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <SideMenu 
        isVisible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)} 
        router={router} 
      />

      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.topBarBtn} 
          onPress={() => setIsMenuVisible(true)}
        >
          <View style={styles.hamburgerLine} />
          <View style={[styles.hamburgerLine, { marginTop: 4 }]} />
          <View style={[styles.hamburgerLine, { marginTop: 4 }]} />
        </TouchableOpacity>
        <Image
          source={require('@/assets/images/logo-transparent.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <TouchableOpacity style={styles.topBarBtn} onPress={() => setIsSearching(!isSearching)}>
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isSearching && (
          <View style={styles.searchWrap}>
            <View style={styles.searchBar}>
              <TextInput
                placeholder="ابحث عن المكسرات، البزورات، أو الوجبات الخفيفة..."
                placeholderTextColor="rgba(63,74,60,0.6)"
                style={styles.searchInput}
                textAlign="right"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                autoFocus
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
                  <Text style={{ fontSize: 18, color: 'rgba(63,74,60,0.6)' }}>✕</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.searchIconWrap}
                onPress={handleSearchSubmit}
              >
                <Text style={{ fontSize: 16 }}>🔍</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="التصنيفات" action="عرض الكل" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillRow}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setSelectedCategory(cat);
                    if (cat !== ALL_LABEL) {
                      router.push(`/browse?category=${cat}` as any);
                    }
                  }}
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

        <View style={styles.promoWrap}>
          <View style={styles.promoBanner}>
            <View style={styles.promoSpecialBadge}>
              <Text style={styles.promoSpecialText}>عرض خاص</Text>
            </View>
            <View style={styles.promoTextBlock}>
              <Text style={styles.promoDiscount}>خصم 30%</Text>
              <Text style={styles.promoSub}>
                على تشكيلة مختارة من{'\n'}المكسرات المحمصة الطازجة
              </Text>
            </View>
            <TouchableOpacity style={styles.promoBtn} activeOpacity={0.85}>
              <Text style={styles.promoBtnText}>اطلب الآن</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity style={styles.greenPillBtn} onPress={() => router.push('/browse')}>
              <Text style={styles.greenPillBtnText}>مشاهدة الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>المنتجات الأكثر طلباً</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hCardRow}
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} width={159} imgH={159} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="جميع المنتجات" action="مشاهدة الكل" />
          <View style={styles.grid}>
            {filteredBySearch.map((product) => (
              <ProductCard key={product.id} product={product} width={CARD_W} imgH={150} />
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav />

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

// Side menu styles
const sideMenuStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63,74,60,0.1)',
  },
  logo: {
    width: 120,
    height: 60,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: COLORS.bodyDark,
  },
  menuItems: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.surfaceCard,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    color: COLORS.primary,
  },
  menuLabel: {
    fontSize: 16,
    ...fontStyle('medium'),
    color: COLORS.bodyDark,
  },
});