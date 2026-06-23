const { query, pool } = require('../config/database');

async function run() {
  try {
    console.log('Ensuring must_change_password column exists...');
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;");

    console.log('Ensuring business multi-tenant table exists...');
    await query(`CREATE TABLE IF NOT EXISTS businesses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      subscription_plan_id INT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Ensuring users have business_id and role columns...');
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS business_id INT REFERENCES businesses(id) ON DELETE CASCADE;");
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'cashier';");

    console.log('Ensuring subscription plans and subscriptions tables exist...');
    await query(`CREATE TABLE IF NOT EXISTS subscription_plans (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      price NUMERIC(12,2) NOT NULL,
      duration_days INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    await query(`CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      plan_id INT REFERENCES subscription_plans(id) ON DELETE SET NULL,
      start_date DATE,
      end_date DATE,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Ensuring business settings table exists...');
    await query(`CREATE TABLE IF NOT EXISTS business_settings (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      vat_percentage NUMERIC(5,2) DEFAULT 0,
      currency VARCHAR(10) DEFAULT 'USD',
      receipt_footer TEXT,
      whatsapp_number VARCHAR(50),
      low_stock_threshold INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Ensuring expense categories and expenses tables exist...');
    await query(`CREATE TABLE IF NOT EXISTS expense_categories (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      name VARCHAR(150) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    await query(`CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      category_id INT REFERENCES expense_categories(id) ON DELETE SET NULL,
      cashier_id INT REFERENCES users(id) ON DELETE SET NULL,
      description TEXT,
      amount NUMERIC(12,2) NOT NULL,
      expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Ensuring cash reconciliation table exists...');
    await query(`CREATE TABLE IF NOT EXISTS cash_reconciliation (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      shift_id INT,
      cashier_id INT REFERENCES users(id) ON DELETE SET NULL,
      expected_cash NUMERIC(12,2) DEFAULT 0,
      actual_cash NUMERIC(12,2) DEFAULT 0,
      difference NUMERIC(12,2) DEFAULT 0,
      reconciled_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Ensuring devices (multi-tenant) table exists...');
    await query(`CREATE TABLE IF NOT EXISTS devices (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      device_id VARCHAR(200) UNIQUE NOT NULL,
      device_name VARCHAR(200),
      status VARCHAR(20) DEFAULT 'registered',
      registered_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Ensuring sync logs table exists...');
    await query(`CREATE TABLE IF NOT EXISTS sync_logs (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      payload JSONB,
      type VARCHAR(100),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    );`);

    console.log('Ensuring notifications table exists...');
    await query(`CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      type VARCHAR(100),
      title VARCHAR(255),
      body TEXT,
      data JSONB,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Ensuring refunds table exists...');
    await query(`CREATE TABLE IF NOT EXISTS refunds (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      sale_id INT,
      cashier_id INT REFERENCES users(id) ON DELETE SET NULL,
      reason TEXT,
      amount NUMERIC(12,2) NOT NULL,
      refunded_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log('Ensuring stock receipts and items tables exist...');
    await query(`CREATE TABLE IF NOT EXISTS stock_receipts (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      supplier VARCHAR(255),
      received_by INT REFERENCES users(id) ON DELETE SET NULL,
      total_amount NUMERIC(12,2) DEFAULT 0,
      received_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    await query(`CREATE TABLE IF NOT EXISTS stock_receipt_items (
      id SERIAL PRIMARY KEY,
      stock_receipt_id INT REFERENCES stock_receipts(id) ON DELETE CASCADE,
      product_id INT,
      quantity NUMERIC(12,2) DEFAULT 0,
      unit_cost NUMERIC(12,2) DEFAULT 0
    );`);

    console.log('Ensuring barcode storage (if needed)');
    await query(`CREATE TABLE IF NOT EXISTS barcodes (
      id SERIAL PRIMARY KEY,
      business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
      product_id INT,
      barcode_value VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

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
