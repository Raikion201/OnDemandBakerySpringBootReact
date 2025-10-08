-- ============================================
-- Script tạo tài khoản Admin cho BakeDelights
-- ============================================
-- Thông tin đăng nhập:
--   Username: admin
--   Email: admin@bakedelights.com  
--   Password: Admin@123
-- ============================================

USE ec;

-- Bước 1: Tạo các roles nếu chưa có
INSERT IGNORE INTO roles (name) VALUES ('ROLE_USER');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_STAFF');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_OWNER');

-- Bước 2: Tạo user admin
-- Password: Admin@123 (BCrypt hash với cost factor 10)
-- Hash này được generate từ BCryptPasswordEncoder trong Spring Security
INSERT INTO users (name, username, email, password) 
VALUES (
    'Administrator',
    'admin',
    'admin@bakedelights.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
) ON DUPLICATE KEY UPDATE
    name = 'Administrator',
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

-- Lưu ID của user admin
SET @admin_user_id = (SELECT id FROM users WHERE username = 'admin');

-- Bước 3: Gán role ADMIN cho user (nếu chưa có)
INSERT IGNORE INTO users_roles (user_id, role_id)
SELECT @admin_user_id, id FROM roles WHERE name = 'ROLE_ADMIN';

-- ============================================
-- Hiển thị thông tin tài khoản đã tạo
-- ============================================
SELECT 
    u.id AS 'User ID',
    u.name AS 'Name',
    u.username AS 'Username',
    u.email AS 'Email',
    GROUP_CONCAT(r.name SEPARATOR ', ') AS 'Roles'
FROM users u
LEFT JOIN users_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin'
GROUP BY u.id, u.name, u.username, u.email;

-- ============================================
-- Thông báo thành công
-- ============================================
SELECT 'Admin account created successfully!' AS 'Status',
       'Username: admin' AS 'Login Info 1',
       'Password: Admin@123' AS 'Login Info 2',
       'URL: http://localhost:3000/admin/login' AS 'Admin Panel';

