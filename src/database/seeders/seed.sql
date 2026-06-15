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
  '$2a$10$Wyf1A4YVxrQA60OXkcw9MO7zD5H/D.bYeop..qHirIp7JazmTLnBK',
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
