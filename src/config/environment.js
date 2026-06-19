require('dotenv').config();

module.exports = {
  PORT:        process.env.PORT        || 3000,
  NODE_ENV:    process.env.NODE_ENV    || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DB_HOST:     process.env.DB_HOST     || 'localhost',
  DB_PORT:     Number(process.env.DB_PORT) || 5432,
  DB_NAME:     process.env.DB_NAME     || 'rms_v1',
  DB_USER:     process.env.DB_USER     || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  // Enable SSL when connecting to a managed Postgres (e.g. Render). Auto-on in production.
  DB_SSL:      process.env.DB_SSL ? process.env.DB_SSL === 'true' : process.env.NODE_ENV === 'production',
  JWT_SECRET:  process.env.JWT_SECRET  || 'CHANGE_THIS_IN_PRODUCTION',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '8h',
  WHATSAPP_TOKEN:        process.env.WHATSAPP_TOKEN        || '',
  WHATSAPP_PHONE_ID:     process.env.WHATSAPP_PHONE_ID     || '',
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'rms_verify',
};
