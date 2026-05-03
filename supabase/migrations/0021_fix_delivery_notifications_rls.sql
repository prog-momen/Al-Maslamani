-- Allow delivery users to insert order_update notifications for their assigned orders
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Delivery can insert order update notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (
        public.is_delivery() AND 
        type = 'order_update' AND
        order_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_id
            AND orders.assigned_delivery_user_id = auth.uid()
        )
    );

-- Allow delivery users to view push tokens to send order update notifications
DROP POLICY IF EXISTS "Admins can view push tokens" ON public.push_tokens;

CREATE POLICY "Admins can view push tokens" ON public.push_tokens
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Delivery can view target push tokens" ON public.push_tokens
    FOR SELECT
    USING (
        public.is_delivery() AND
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.user_id = push_tokens.user_id
            AND orders.assigned_delivery_user_id = auth.uid()
        )
    );
