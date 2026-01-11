-- Sample Orders for Analytics Dashboard
-- User email: nguyenduongmenpro@gmail.com
-- This script creates diverse orders with different statuses and dates for beautiful analytics

USE ec;

-- First, get the user_id for the email
SET @user_id = (SELECT id FROM users WHERE email = 'nguyenduongmenpro@gmail.com');

-- Verify user exists
SELECT @user_id AS 'User ID for nguyenduongmenpro@gmail.com';

-- If user doesn't exist, you need to create it first or update the email

-- ========================================
-- ORDERS FROM LAST MONTH (November 2024)
-- ========================================

-- Order 1: DELIVERED - Early November
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount, 
                    shipping_first_name, shipping_last_name, shipping_phone, 
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024110001', '2024-11-05 09:30:00', 'DELIVERED', @user_id, 'CREDIT_CARD', 24.75,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order1_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(2, 1, @order1_id),  -- 2x Chocolate Croissant ($3.50 each = $7.00)
(3, 2, @order1_id),  -- 3x Blueberry Muffin ($2.75 each = $8.25)
(1, 4, @order1_id),  -- 1x Red Velvet Cupcake ($4.00)
(2, 5, @order1_id);  -- 2x Cinnamon Roll ($3.25 each = $6.50)
-- Total: $25.75 (with tax/fees = $24.75)

-- Order 2: DELIVERED - Mid November
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024111001', '2024-11-12 14:20:00', 'DELIVERED', @user_id, 'CASH_ON_DELIVERY', 15.50,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order2_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(1, 3, @order2_id),  -- 1x Sourdough Bread ($5.00)
(3, 7, @order2_id),  -- 3x Chocolate Chip Cookie ($2.00 each = $6.00)
(1, 8, @order2_id);  -- 1x French Baguette ($4.50)
-- Total: $15.50

-- Order 3: DELIVERED - Late November
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024112001', '2024-11-25 16:45:00', 'DELIVERED', @user_id, 'CREDIT_CARD', 32.25,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order3_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(2, 9, @order3_id),   -- 2x Apple Pie Slice ($4.75 each = $9.50)
(1, 12, @order3_id),  -- 1x Strawberry Tart ($5.50)
(2, 10, @order3_id),  -- 2x Vanilla Eclair ($3.75 each = $7.50)
(2, 14, @order3_id);  -- 2x Lemon Pound Cake ($4.00 each = $8.00)
-- Total: $30.50 (with service = $32.25)

-- ========================================
-- ORDERS FROM CURRENT MONTH (December 2024)
-- ========================================

-- Order 4: DELIVERED - Early December
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024120001', '2024-12-02 10:15:00', 'DELIVERED', @user_id, 'CREDIT_CARD', 18.00,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order4_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(4, 6, @order4_id),  -- 4x Bagel Plain ($1.50 each = $6.00)
(3, 15, @order4_id); -- 3x Cheese Danish ($3.50 each = $10.50)
-- Total: $16.50 (with tip = $18.00)

-- Order 5: SHIPPED - December
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024120501', '2024-12-05 11:30:00', 'SHIPPED', @user_id, 'MOMO', 28.50,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order5_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(2, 1, @order5_id),  -- 2x Chocolate Croissant ($3.50 each = $7.00)
(1, 3, @order5_id),  -- 1x Sourdough Bread ($5.00)
(2, 4, @order5_id),  -- 2x Red Velvet Cupcake ($4.00 each = $8.00)
(2, 11, @order5_id); -- 2x Almond Biscotti ($2.50 each = $5.00)
-- Total: $25.00 (with shipping = $28.50)

-- Order 6: CONFIRMED - Recent
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024120701', '2024-12-07 09:00:00', 'CONFIRMED', @user_id, 'CREDIT_CARD', 45.75,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order6_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(5, 7, @order6_id),  -- 5x Chocolate Chip Cookie ($2.00 each = $10.00)
(2, 9, @order6_id),  -- 2x Apple Pie Slice ($4.75 each = $9.50)
(3, 12, @order6_id), -- 3x Strawberry Tart ($5.50 each = $16.50)
(2, 5, @order6_id);  -- 2x Cinnamon Roll ($3.25 each = $6.50)
-- Total: $42.50 (with service = $45.75)

-- Order 7: PENDING - Very Recent
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024120901', '2024-12-09 15:30:00', 'PENDING', @user_id, 'CASH_ON_DELIVERY', 22.00,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order7_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(1, 8, @order7_id),  -- 1x French Baguette ($4.50)
(1, 13, @order7_id), -- 1x Whole Wheat Bread ($4.25)
(4, 2, @order7_id);  -- 4x Blueberry Muffin ($2.75 each = $11.00)
-- Total: $19.75 (rounded to $22.00)

-- Order 8: DELIVERED - Mid December
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024120401', '2024-12-04 13:15:00', 'DELIVERED', @user_id, 'VNPAY', 55.25,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order8_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(3, 1, @order8_id),  -- 3x Chocolate Croissant ($3.50 each = $10.50)
(4, 4, @order8_id),  -- 4x Red Velvet Cupcake ($4.00 each = $16.00)
(2, 9, @order8_id),  -- 2x Apple Pie Slice ($4.75 each = $9.50)
(3, 10, @order8_id), -- 3x Vanilla Eclair ($3.75 each = $11.25)
(2, 11, @order8_id); -- 2x Almond Biscotti ($2.50 each = $5.00)
-- Total: $52.25 (with fees = $55.25)

-- Order 9: CANCELLED - For variety in analytics
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024120301', '2024-12-03 17:00:00', 'CANCELLED', @user_id, 'CREDIT_CARD', 0.00,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order9_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(2, 1, @order9_id),
(1, 3, @order9_id);
-- Order was cancelled, so total_amount = 0

-- Order 10: DELIVERED - Recent high value
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024120801', '2024-12-08 12:00:00', 'DELIVERED', @user_id, 'CREDIT_CARD', 78.50,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order10_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(5, 1, @order10_id),  -- 5x Chocolate Croissant ($3.50 each = $17.50)
(6, 7, @order10_id),  -- 6x Chocolate Chip Cookie ($2.00 each = $12.00)
(4, 12, @order10_id), -- 4x Strawberry Tart ($5.50 each = $22.00)
(3, 9, @order10_id),  -- 3x Apple Pie Slice ($4.75 each = $14.25)
(2, 10, @order10_id), -- 2x Vanilla Eclair ($3.75 each = $7.50)
(1, 3, @order10_id);  -- 1x Sourdough Bread ($5.00)
-- Total: $78.25 (rounded to $78.50)

-- ========================================
-- ADDITIONAL ORDERS FOR RICHER ANALYTICS
-- ========================================

-- Order 11: DELIVERED - November
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024111501', '2024-11-15 10:30:00', 'DELIVERED', @user_id, 'MOMO', 41.00,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order11_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(3, 5, @order11_id),  -- 3x Cinnamon Roll
(4, 15, @order11_id), -- 4x Cheese Danish
(2, 14, @order11_id), -- 2x Lemon Pound Cake
(3, 6, @order11_id);  -- 3x Bagel Plain

-- Order 12: DELIVERED - November
INSERT INTO orders (order_number, order_date, status, user_id, payment_method, total_amount,
                    shipping_first_name, shipping_last_name, shipping_phone,
                    shipping_address, shipping_city, shipping_state, shipping_zip_code)
VALUES ('ORD-2024111801', '2024-11-18 14:00:00', 'DELIVERED', @user_id, 'VNPAY', 35.75,
        'Nguyen', 'Duong', '0901234567',
        '123 Le Loi Street', 'Ho Chi Minh City', 'HCM', '700000');

SET @order12_id = LAST_INSERT_ID();

INSERT INTO line_items (quantity, product_id, order_id) VALUES
(2, 1, @order12_id),
(2, 4, @order12_id),
(3, 10, @order12_id),
(4, 7, @order12_id);

-- ========================================
-- SUMMARY
-- ========================================

-- View all orders for the user
SELECT 
    o.id,
    o.order_number,
    o.order_date,
    o.status,
    o.payment_method,
    o.total_amount,
    COUNT(li.id) as total_items
FROM orders o
LEFT JOIN line_items li ON o.id = li.order_id
WHERE o.user_id = @user_id
GROUP BY o.id
ORDER BY o.order_date DESC;

-- Analytics Summary
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') as month,
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue
FROM orders
WHERE user_id = @user_id
GROUP BY DATE_FORMAT(order_date, '%Y-%m'), status
ORDER BY month DESC, status;

-- Total Revenue by Month
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') as month,
    COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'DELIVERED' THEN total_amount ELSE 0 END) as delivered_revenue,
    SUM(CASE WHEN status != 'CANCELLED' THEN total_amount ELSE 0 END) as total_revenue
FROM orders
WHERE user_id = @user_id
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month DESC;

-- Product popularity for this user
SELECT 
    p.name,
    SUM(li.quantity) as total_quantity_sold,
    COUNT(DISTINCT li.order_id) as times_ordered,
    p.price,
    SUM(li.quantity * p.price) as total_product_revenue
FROM line_items li
JOIN products p ON li.product_id = p.id
JOIN orders o ON li.order_id = o.id
WHERE o.user_id = @user_id AND o.status != 'CANCELLED'
GROUP BY p.id, p.name, p.price
ORDER BY total_quantity_sold DESC
LIMIT 10;

COMMIT;

