-- ================================================================
-- RMS V1 - Seed Data (Development / Demo)
-- Run AFTER schema.sql
-- ================================================================

-- Default admin user (password: Admin@1234)
-- bcrypt hash for 'Admin@1234' with 10 rounds
INSERT INTO users (name, email, password_hash, role_id)
VALUES (
  'Business Owner',
  'owner@rms.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihC',
  (SELECT id FROM roles WHERE name = 'owner')
) ON CONFLICT (email) DO NOTHING;

-- Sample categories
INSERT INTO categories (name) VALUES
  ('General'),
  ('Beverages'),
  ('Groceries'),
  ('Electronics'),
  ('Clothing')
ON CONFLICT (name) DO NOTHING;
