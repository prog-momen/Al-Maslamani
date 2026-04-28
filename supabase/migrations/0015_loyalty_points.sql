-- جدول رصيد النقاط لكل مستخدم
CREATE TABLE IF NOT EXISTS loyalty_points (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجل النقاط (تاريخ كل عملية إضافة/خصم)
CREATE TABLE IF NOT EXISTS loyalty_points_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    order_id BIGINT REFERENCES orders(id),
    points_delta INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تريجر لإضافة سجل عند تحديث النقاط
CREATE OR REPLACE FUNCTION log_loyalty_points_change() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.points <> OLD.points THEN
        INSERT INTO loyalty_points_history (user_id, order_id, points_delta, reason, created_at)
        VALUES (NEW.user_id, NULL, NEW.points - OLD.points, 'manual update', NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS loyalty_points_update_trigger ON loyalty_points;
CREATE TRIGGER loyalty_points_update_trigger
AFTER UPDATE ON loyalty_points
FOR EACH ROW
EXECUTE FUNCTION log_loyalty_points_change();
