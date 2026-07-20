const { Pool } = require('pg');
const env = require('./environment');

const ssl = env.DB_SSL ? { rejectUnauthorized: false } : false;
const password = env.DB_PASSWORD == null ? '' : String(env.DB_PASSWORD);

// Prefer a single DATABASE_URL connection string (the standard on Render/Heroku);
// fall back to individual DB_* variables for local development.
const poolConfig = env.DATABASE_URL
  ? { connectionString: String(env.DATABASE_URL), ssl }
  : {
      host:     String(env.DB_HOST),
      port:     Number(env.DB_PORT),
      database: String(env.DB_NAME),
      user:     String(env.DB_USER),
      password,
      ssl,
    };

const pool = new Pool({
  ...poolConfig,
  max:                     20,
  idleTimeoutMillis:       30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

async function testConnection() {
  const client = await pool.connect();
  const target = env.DATABASE_URL ? 'DATABASE_URL' : env.DB_NAME + '@' + env.DB_HOST;
  console.log('PostgreSQL connected -> ' + target + (ssl ? ' (SSL)' : ''));
  client.release();
}

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query, testConnection };
