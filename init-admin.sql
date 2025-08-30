-- Create admin user with correct password hash
-- Username: admin
-- Password: admin123
-- Hash generated with PasswordManager.hash()
INSERT OR IGNORE INTO users (id, username, password_hash, email, name, is_active) VALUES 
    (1, 'admin', 'c318364b3ba2dca242d2e534b03fb0cb6e7e5f1fb208409edd51ea34a41aa4d1', 'admin@salon.local', 'システム管理者', 1);

-- Insert default menus
INSERT OR IGNORE INTO menus (id, name, duration_min, price, is_active) VALUES 
    (1, 'カット', 60, 4000, 1),
    (2, 'カット + カラー', 120, 8000, 1),
    (3, 'カット + パーマ', 150, 10000, 1),
    (4, 'シャンプー + ブロー', 30, 2000, 1),
    (5, 'ヘッドスパ', 45, 3500, 1);

-- Insert sample customers
INSERT OR IGNORE INTO customers (id, name, phone, email, notes) VALUES 
    (1, '田中 太郎', '090-1234-5678', 'tanaka@example.com', 'カットのみ希望'),
    (2, '佐藤 花子', '090-9876-5432', 'sato@example.com', 'カラーアレルギーあり'),
    (3, '鈴木 次郎', '080-1111-2222', 'suzuki@example.com', '月1回来店');

-- Insert sample bookings for testing
INSERT OR IGNORE INTO bookings (id, customer_id, start_at, end_at, menu_id, source, status, confidence_score) VALUES 
    (1, 1, datetime('now', '+1 hour'), datetime('now', '+2 hour'), 1, 'form', 'confirmed', 1.0),
    (2, 2, datetime('now', '+3 hour'), datetime('now', '+5 hour'), 2, 'hpb', 'confirmed', 1.0),
    (3, 3, datetime('now', '+1 day'), datetime('now', '+1 day', '+1 hour'), 1, 'lime', 'needs_review', 0.8);