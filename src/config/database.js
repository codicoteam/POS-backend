const { Pool } = require('pg');
const env = require('./environment');

const pool = new Pool({
  host:                    env.DB_HOST,
  port:                    env.DB_PORT,
  database:                env.DB_NAME,
  user:                    env.DB_USER,
  password:                env.DB_PASSWORD,
  max:                     20,
  idleTimeoutMillis:       30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

async function testConnection() {
  const client = await pool.connect();
  console.log('PostgreSQL connected -> ' + env.DB_NAME + '@' + env.DB_HOST);
  client.release();
}

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query, testConnection };
