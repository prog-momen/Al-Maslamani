-- وظيفة لإضافة النقاط عند اكتمال الطلب
CREATE OR REPLACE FUNCTION add_loyalty_points_on_order_complete()
RETURNS TRIGGER AS $$
DECLARE
    points_to_add INTEGER;
BEGIN
    -- فقط إذا كان الطلب مكتمل
    IF NEW.status = 'delivered' AND OLD.status <> 'delivered' THEN
        points_to_add := FLOOR(NEW.total_amount);
        IF points_to_add > 0 THEN
            INSERT INTO loyalty_points (user_id, points, updated_at)
            VALUES (NEW.user_id, points_to_add, NOW())
            ON CONFLICT (user_id) DO UPDATE
            SET points = loyalty_points.points + points_to_add,
                updated_at = NOW();
            INSERT INTO loyalty_points_history (user_id, order_id, points_delta, reason, created_at)
            VALUES (NEW.user_id, NEW.id, points_to_add, 'order delivered', NOW());
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_loyalty_points_on_order_complete_trigger ON orders;
CREATE TRIGGER add_loyalty_points_on_order_complete_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION add_loyalty_points_on_order_complete();
