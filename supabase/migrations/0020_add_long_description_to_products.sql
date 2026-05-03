-- Add long_description column to products for detailed product info.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS long_description TEXT;
