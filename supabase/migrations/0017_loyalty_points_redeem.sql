-- وظيفة لاستبدال النقاط بالخصم
-- كل 500 نقطة = 20 شيكل خصم
CREATE OR REPLACE FUNCTION redeem_loyalty_points(_user_id UUID, _points_to_redeem INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_points INTEGER;
    discount_amount INTEGER;
BEGIN
    SELECT points INTO current_points FROM loyalty_points WHERE user_id = _user_id;
    IF current_points IS NULL OR current_points < _points_to_redeem THEN
        RAISE EXCEPTION 'Not enough points';
    END IF;
    IF _points_to_redeem % 500 <> 0 THEN
        RAISE EXCEPTION 'Points to redeem must be a multiple of 500';
    END IF;
    discount_amount := (_points_to_redeem / 500) * 20;
    UPDATE loyalty_points SET points = points - _points_to_redeem, updated_at = NOW() WHERE user_id = _user_id;
    INSERT INTO loyalty_points_history (user_id, order_id, points_delta, reason, created_at)
    VALUES (_user_id, NULL, -_points_to_redeem, 'redeem', NOW());
    RETURN discount_amount;
END;
$$ LANGUAGE plpgsql;
