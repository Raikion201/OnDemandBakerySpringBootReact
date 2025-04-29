-- 1st: 
SELECT * FROM users WHERE id = 1 AND username = 'duongdoc04';

-- 2nd:
INSERT INTO orders (order_date, user_id, status, total_amount, delivery_address, contact_phone, confirmed_time, preparing_time)
VALUES 
(NOW(), 1, 'PREPARING', 150000, '123 Nguyen Hue, District 1, HCMC', '0912345678', 
 DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR));
-- 3rd:
SET @last_order_id = LAST_INSERT_ID();
-- 4th:
-- Thêm sản phẩm 1
INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal)
VALUES (@last_order_id, 'Bánh mì thịt nướng đặc biệt', 2, 35000, 70000);

-- Thêm sản phẩm 2
INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal)
VALUES (@last_order_id, 'Bánh croissant bơ Pháp', 3, 25000, 75000);

-- Thêm sản phẩm 3
INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal)
VALUES (@last_order_id, 'Cafe sữa đá', 1, 5000, 5000);

-- 5th:
-- Thêm đơn hàng
INSERT INTO orders (order_date, user_id, status, total_amount, delivery_address, contact_phone, confirmed_time, preparing_time)
VALUES (NOW(), 1, 'PREPARING', 150000, '123 Nguyen Hue, District 1, HCMC', '0912345678', 
DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Lấy ID đơn hàng vừa thêm
SET @order_id = LAST_INSERT_ID();

-- Thêm các mục trong đơn hàng
INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal)
VALUES 
(@order_id, 'Bánh mì thịt nướng đặc biệt', 2, 35000, 70000),
(@order_id, 'Bánh croissant bơ Pháp', 3, 25000, 75000),
(@order_id, 'Cafe sữa đá', 1, 5000, 5000);

-- 6th:
-- Đơn hàng đang chờ xác nhận (PENDING)
INSERT INTO orders (order_date, user_id, status, total_amount, delivery_address, contact_phone)
VALUES (NOW(), 1, 'PENDING', 85000, '456 Le Loi, District 1, HCMC', '0912345678');

SET @pending_order_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal)
VALUES 
(@pending_order_id, 'Bánh tiramisu', 2, 30000, 60000),
(@pending_order_id, 'Trà đào cam sả', 1, 25000, 25000);

-- Đơn hàng đã giao hàng (DELIVERED)
INSERT INTO orders (order_date, user_id, status, total_amount, delivery_address, contact_phone, 
confirmed_time, preparing_time, ready_for_delivery_time, out_for_delivery_time, delivered_time)
VALUES (
    DATE_SUB(NOW(), INTERVAL 2 DAY), 
    1, 
    'DELIVERED', 
    220000, 
    '789 Ham Nghi, District 1, HCMC', 
    '0912345678',
    DATE_SUB(NOW(), INTERVAL 47 HOUR),
    DATE_SUB(NOW(), INTERVAL 46 HOUR),
    DATE_SUB(NOW(), INTERVAL 45 HOUR),
    DATE_SUB(NOW(), INTERVAL 44 HOUR),
    DATE_SUB(NOW(), INTERVAL 43 HOUR)
);

SET @delivered_order_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal)
VALUES 
(@delivered_order_id, 'Bánh sinh nhật chocolate', 1, 180000, 180000),
(@delivered_order_id, 'Nước ép cam tươi', 2, 20000, 40000);