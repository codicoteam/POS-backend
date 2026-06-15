DELETE FROM users WHERE email = 'owner@rms.com';

INSERT INTO users (name, email, password_hash, role_id)
VALUES (
  'Business Owner',
  'owner@rms.com',
  '$2a$10$Wyf1A4YVxrQA60OXkcw9MO7zD5H/D.bYeop..qHirIp7JazmTLnBK',
  1
);

SELECT email, password_hash FROM users WHERE email = 'owner@rms.com';
