import { createClient } from '@supabase/supabase-js';
import process from 'node:process';
import xlsx from 'xlsx';

const workbookPath = process.env.PRODUCTS_XLSX_PATH || 'products.xlsx';
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

function normalizeDriveUrl(url) {
  if (!url) {
    return null;
  }

  const match = String(url).match(/\/d\/([^/]+)\//);
  if (!match) {
    return String(url).trim();
  }

  return `https://drive.google.com/uc?export=view&id=${match[1]}`;
}

function parsePrice(rawName) {
  const text = String(rawName || '');
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:₪|شيكل|ILS)/i);
  if (!match) {
    return 0;
  }
  return Number(match[1]);
}

const workbook = xlsx.readFile(workbookPath);
const firstSheet = workbook.SheetNames.find((name) => {
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[name], { defval: null });
  return rows.length > 0;
});

if (!firstSheet) {
  throw new Error(`No rows found in workbook: ${workbookPath}`);
}

const rows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: null });

const parsedRows = rows
  .map((row) => ({
    name: String(row['الاسم'] || '').trim(),
    category: String(row['النوع'] || '').trim(),
    size: String(row['الحجم'] || '').trim(),
    imageUrl: normalizeDriveUrl(row['الصورة']),
  }))
  .filter((row) => row.name && row.category);

if (parsedRows.length === 0) {
  throw new Error('No valid rows found. Expected columns: الاسم, النوع, الحجم, الصورة');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const uniqueCategories = [...new Set(parsedRows.map((row) => row.category))];

const { error: upsertCategoriesError } = await supabase
  .from('categories')
  .upsert(uniqueCategories.map((name) => ({ name })), { onConflict: 'name' });

if (upsertCategoriesError) {
  throw upsertCategoriesError;
}

const { data: categoryRows, error: categoriesError } = await supabase
  .from('categories')
  .select('id,name')
  .in('name', uniqueCategories);

if (categoriesError) {
  throw categoriesError;
}

const categoryIdByName = new Map((categoryRows || []).map((row) => [row.name, row.id]));

const { error: clearProductsError } = await supabase
  .from('products')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000');

if (clearProductsError) {
  throw clearProductsError;
}

const productsPayload = parsedRows.map((row) => ({
  category_id: categoryIdByName.get(row.category) || null,
  name: row.name,
  description: row.size || null,
  price: parsePrice(row.name),
  image_url: row.imageUrl,
  stock: 100,
  is_active: true,
}));

const { error: insertProductsError } = await supabase.from('products').insert(productsPayload);

if (insertProductsError) {
  throw insertProductsError;
}

console.log(`Imported ${productsPayload.length} products from ${workbookPath}`);