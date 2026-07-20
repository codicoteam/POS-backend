require('dotenv').config();

function toStringValue(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

module.exports = {
  PORT: Number(process.env.PORT || 3000),
  NODE_ENV: toStringValue(process.env.NODE_ENV, 'development'),
  DATABASE_URL: toStringValue(process.env.DATABASE_URL),
  DB_HOST: toStringValue(process.env.DB_HOST, 'localhost'),
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_NAME: toStringValue(process.env.DB_NAME, 'rms_v1'),
  DB_USER: toStringValue(process.env.DB_USER, 'postgres'),
  DB_PASSWORD: toStringValue(process.env.DB_PASSWORD),
  // Enable SSL when connecting to a managed Postgres (e.g. Render). Auto-on in production.
  DB_SSL: process.env.DB_SSL ? process.env.DB_SSL === 'true' : process.env.NODE_ENV === 'production',
  JWT_SECRET: toStringValue(process.env.JWT_SECRET, 'CHANGE_THIS_IN_PRODUCTION'),
  JWT_EXPIRES: toStringValue(process.env.JWT_EXPIRES, '8h'),
  WHATSAPP_TOKEN: toStringValue(process.env.WHATSAPP_TOKEN),
  WHATSAPP_PHONE_ID: toStringValue(process.env.WHATSAPP_PHONE_ID),
  WHATSAPP_VERIFY_TOKEN: toStringValue(process.env.WHATSAPP_VERIFY_TOKEN, 'rms_verify'),
};
