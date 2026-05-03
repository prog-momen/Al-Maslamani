-- Add features column to products to store tags like 'Organic', 'High Protein', etc.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
