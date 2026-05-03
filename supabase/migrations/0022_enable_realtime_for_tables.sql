-- Enable Realtime for the specified tables by adding them to the supabase_realtime publication

-- Ensure the publication exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add tables to the publication
-- Note: We use ALTER PUBLICATION ... ADD TABLE. 
-- If a table is already in the publication, this might throw an error in some environments, 
-- but in Supabase it's usually fine or handled by separate UI.
-- To be safe and idempotent, we can drop and recreate or use a script.

ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.favorites;
