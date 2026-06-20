const { query, pool } = require('../config/database');

async function run() {
  try {
    console.log('Ensuring must_change_password column exists...');
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;");

    console.log('Ensuring expenses table exists...');
    await query(`CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      cashier_id INT REFERENCES users(id) ON DELETE SET NULL,
      category VARCHAR(100),
      description TEXT,
      amount NUMERIC(12,2) NOT NULL,
      expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Ensuring shifts table exists...');
    await query(`CREATE TABLE IF NOT EXISTS shifts (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      status VARCHAR(20) DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Ensuring devices table exists...');
    await query(`CREATE TABLE IF NOT EXISTS devices (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(200) UNIQUE NOT NULL,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      device_name VARCHAR(200),
      status VARCHAR(20) DEFAULT 'registered',
      registered_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Migrations applied.');
  } catch (err) {
    console.error('Migration error:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
