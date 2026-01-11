-- Gán role ADMIN cho user admin1

-- 1. Kiểm tra user admin1 tồn tại
SELECT id, username, email FROM users WHERE username = 'admin1';

-- 2. Xóa role cũ của admin1 (nếu có)
DELETE FROM users_roles WHERE user_id IN (SELECT id FROM users WHERE username = 'admin1');

-- 3. Gán role ADMIN cho admin1
INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.username = 'admin1' AND r.name = 'ROLE_ADMIN';

-- 4. Kiểm tra kết quả
SELECT 
    u.id,
    u.username, 
    u.email,
    r.name as role
FROM users u
JOIN users_roles ur ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE u.username = 'admin1';

