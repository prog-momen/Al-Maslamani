-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('offer', 'discount_code', 'order_update')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    discount_code TEXT,
    discount_value TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means global / broadcast
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read global notifications or notifications sent specifically to them
CREATE POLICY "Users can view their own or global notifications" ON public.notifications
    FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

-- Policy: Only admins can insert/update/delete notifications
CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
