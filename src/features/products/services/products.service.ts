import { supabase } from '@/src/lib/supabase/client';

const sb = supabase as any;

export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_name: string | null;
};

export type ProductVariant = {
  id: string;
  size: string;
  price: number;
  image_url: string | null;
};

export type GroupedProduct = {
  name: string;
  description: string | null;
  category_name: string | null;
  variants: ProductVariant[];
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  categories: { name: string } | { name: string }[] | null;
};

function mapCategoryName(categories: ProductRow['categories']): string | null {
  if (!categories) {
    return null;
  }

  if (Array.isArray(categories)) {
    return categories[0]?.name ?? null;
  }

  return categories.name ?? null;
}

function normalizeImageUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();
  const driveIdMatch = trimmed.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]{10,})/);

  if (driveIdMatch?.[1]) {
    // Google Drive thumbnail endpoint is more reliable for mobile/web rendering.
    return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w1200`;
  }

  return trimmed;
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id,name,description,price,image_url,categories(name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ProductRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image_url: normalizeImageUrl(row.image_url),
    category_name: mapCategoryName(row.categories),
  }));
}

export async function getGroupedProducts(): Promise<GroupedProduct[]> {
  const products = await getCatalogProducts();
  const groups: Record<string, GroupedProduct> = {};

  products.forEach(p => {
    const trimmedName = p.name.trim();
    if (!groups[trimmedName]) {
      groups[trimmedName] = {
        name: trimmedName,
        description: p.description, // Can be improved to handle shared desc
        category_name: p.category_name,
        variants: []
      };
    }
    
    // We treat description as the 'size' if it matches a weight pattern, or just use it as is
    groups[trimmedName].variants.push({
      id: p.id,
      size: p.description || 'قياسي',
      price: p.price,
      image_url: p.image_url
    });
  });

  // Sort variants by price (usually represents size order)
  Object.values(groups).forEach(group => {
    group.variants.sort((a, b) => a.price - b.price);
  });

  return Object.values(groups);
}

export async function getFavoriteProducts(userId: string): Promise<CatalogProduct[]> {
  const { data, error } = await sb
    .from('favorites')
    .select('products!inner(id,name,description,price,image_url,categories(name))')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as {
    products: ProductRow | ProductRow[];
  }[];

  return rows
    .map((row) => (Array.isArray(row.products) ? row.products[0] : row.products))
    .filter(Boolean)
    .map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: normalizeImageUrl(product.image_url),
      category_name: mapCategoryName(product.categories),
    }));
}

export async function setFavoriteProduct(userId: string, productId: string, favorite: boolean) {
  if (favorite) {
    const { error } = await sb.from('favorites').insert({ user_id: userId, product_id: productId });
    if (error && error.code !== '23505') {
      throw error;
    }
    return;
  }

  const { error } = await sb
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    throw error;
  }
}

export async function getFavoriteProductIds(userId: string): Promise<string[]> {
  const { data, error } = await sb
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: { product_id: string }) => row.product_id);
}

export async function getProductById(productId: string): Promise<CatalogProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id,name,description,price,image_url,categories(name)')
    .eq('id', productId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as ProductRow;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image_url: normalizeImageUrl(row.image_url),
    category_name: mapCategoryName(row.categories),
  };
}

export async function getProductGroupByProductId(productId: string): Promise<GroupedProduct | null> {
  const mainProduct = await getProductById(productId);
  if (!mainProduct) return null;

  const allProducts = await getCatalogProducts();
  const variants = allProducts
    .filter(p => p.name.trim() === mainProduct.name.trim())
    .map(p => ({
      id: p.id,
      size: p.description || 'قياسي',
      price: p.price,
      image_url: p.image_url
    }))
    .sort((a, b) => a.price - b.price);

  return {
    name: mainProduct.name,
    description: mainProduct.description,
    category_name: mainProduct.category_name,
    variants
  };
}