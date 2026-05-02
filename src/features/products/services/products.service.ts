import { supabase } from '@/src/lib/supabase/client';

const sb = supabase as any;

export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_name: string | null;
  packaging: string | null;
  features?: string[];
  long_description?: string | null;
};

export type ProductVariant = {
  id: string;
  size: string;
  price: number;
  image_url: string | null;
  packaging: string | null;
  features?: string[];
  long_description?: string | null;
};

export type GroupedProduct = {
  name: string;
  description: string | null;
  category_name: string | null;
  packaging: string | null;
  features: string[];
  long_description: string | null;
  variants: ProductVariant[];
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  packaging: string | null;
  features: string[] | null;
  long_description: string | null;
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
    .select('id,name,description,price,image_url,packaging,features,long_description,categories(name)')
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
    packaging: row.packaging,
    features: row.features || [],
    long_description: row.long_description,
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
        description: p.description,
        category_name: p.category_name,
        packaging: p.packaging,
        features: p.features || [],
        long_description: p.long_description || '',
        variants: []
      };
    }
    
    // We treat description as the 'size' if it matches a weight pattern, or just use it as is
    groups[trimmedName].variants.push({
      id: p.id,
      size: p.description || 'قياسي',
      price: p.price,
      image_url: p.image_url,
      packaging: p.packaging,
      features: p.features,
      long_description: p.long_description
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
    .select('products!inner(id,name,description,price,image_url,packaging,features,long_description,categories(name))')
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
      packaging: product.packaging,
      features: product.features || [],
      long_description: product.long_description,
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
    .select('id,name,description,price,image_url,packaging,features,long_description,categories(name)')
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
    packaging: row.packaging,
    features: row.features || [],
    long_description: row.long_description,
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
      image_url: p.image_url,
      packaging: p.packaging
    }))
    .sort((a, b) => a.price - b.price);

  return {
    name: mainProduct.name,
    description: mainProduct.description,
    category_name: mainProduct.category_name,
    packaging: mainProduct.packaging,
    features: mainProduct.features || [],
    long_description: mainProduct.long_description || '',
    variants
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin-only product management
// ─────────────────────────────────────────────────────────────────────────────

export type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  packaging: string | null;
  category_id: string | null;
  category_name: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  features?: string[];
  long_description?: string | null;
};

export type AdminProductInput = {
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  packaging?: string | null;
  category_id?: string | null;
  stock?: number;
  is_active?: boolean;
  features?: string[];
  long_description?: string | null;
};

/** Fetch ALL products (active + inactive) for admin management */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id,name,description,price,image_url,packaging,category_id,stock,is_active,created_at,features,long_description,categories(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image_url: row.image_url,
    packaging: row.packaging,
    category_id: row.category_id,
    category_name: mapCategoryName(row.categories),
    stock: row.stock ?? 0,
    is_active: row.is_active ?? true,
    created_at: row.created_at,
    features: row.features || [],
    long_description: row.long_description,
  }));
}

/** Create a new product */
export async function adminCreateProduct(input: AdminProductInput): Promise<AdminProduct> {
  const { data, error } = await sb
    .from('products')
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      price: input.price,
      image_url: input.image_url?.trim() ?? null,
      packaging: input.packaging?.trim() ?? null,
      category_id: input.category_id ?? null,
      stock: input.stock ?? 0,
      is_active: input.is_active ?? true,
      features: input.features || [],
      long_description: input.long_description?.trim() ?? null,
    })
    .select('id,name,description,price,image_url,packaging,category_id,stock,is_active,created_at,features,long_description,categories(name)')
    .single();

  if (error) throw error;

  const row = data as any;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image_url: row.image_url,
    packaging: row.packaging,
    category_id: row.category_id,
    category_name: mapCategoryName(row.categories),
    stock: row.stock ?? 0,
    is_active: row.is_active ?? true,
    created_at: row.created_at,
    features: row.features || [],
    long_description: row.long_description,
  };
}

/** Update an existing product */
export async function adminUpdateProduct(productId: string, input: AdminProductInput): Promise<AdminProduct> {
  const { data, error } = await sb
    .from('products')
    .update({
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      price: input.price,
      image_url: input.image_url?.trim() ?? null,
      packaging: input.packaging?.trim() ?? null,
      category_id: input.category_id ?? null,
      stock: input.stock ?? 0,
      is_active: input.is_active ?? true,
      features: input.features || [],
      long_description: input.long_description?.trim() ?? null,
    })
    .eq('id', productId)
    .select('id,name,description,price,image_url,packaging,category_id,stock,is_active,created_at,features,long_description,categories(name)')
    .single();

  if (error) throw error;

  const row = data as any;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image_url: row.image_url,
    packaging: row.packaging,
    category_id: row.category_id,
    category_name: mapCategoryName(row.categories),
    stock: row.stock ?? 0,
    is_active: row.is_active ?? true,
    created_at: row.created_at,
    features: row.features || [],
    long_description: row.long_description,
  };
}

/** Toggle product active/inactive without deleting */
export async function adminToggleProductActive(productId: string, isActive: boolean): Promise<void> {
  const { error } = await sb
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId);

  if (error) throw error;
}

/** Permanently delete a product */
export async function adminDeleteProduct(productId: string): Promise<void> {
  const { error } = await sb
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
}

/** Fetch all categories for the product form picker */
export type CategoryOption = { id: string; name: string };

export async function getCategories(): Promise<CategoryOption[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id,name')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as CategoryOption[];
}