-- ================================================================
-- RMS V1 - PostgreSQL Database Schema
-- ================================================================

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL  -- owner, manager, cashier, inventory_clerk
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id       INT REFERENCES roles(id) ON DELETE SET NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Product Categories
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  sku           VARCHAR(100) UNIQUE,
  barcode       VARCHAR(100) UNIQUE,
  category_id   INT REFERENCES categories(id) ON DELETE SET NULL,
  cost_price    NUMERIC(12,2) DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL,
  description   TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id                  SERIAL PRIMARY KEY,
  product_id          INT REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  quantity            INT DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold INT DEFAULT 10,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id          SERIAL PRIMARY KEY,
  product_id  INT REFERENCES products(id) ON DELETE CASCADE,
  type        VARCHAR(30) NOT NULL,  -- sale, refund, adjustment, purchase
  quantity    INT NOT NULL,          -- positive = stock in, negative = stock out
  note        TEXT,
  created_by  INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  phone       VARCHAR(30),
  email       VARCHAR(150),
  loyalty_pts INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id             SERIAL PRIMARY KEY,
  customer_id    INT REFERENCES customers(id) ON DELETE SET NULL,
  cashier_id     INT REFERENCES users(id) ON DELETE SET NULL,
  subtotal       NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total          NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'cash', -- cash, card, mobile_money
  amount_tendered NUMERIC(12,2),
  change_given   NUMERIC(12,2),
  status         VARCHAR(20) NOT NULL DEFAULT 'completed', -- completed, refunded, voided
  note           TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
  id         SERIAL PRIMARY KEY,
  sale_id    INT REFERENCES sales(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  quantity   INT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  subtotal   NUMERIC(12,2) NOT NULL
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id         SERIAL PRIMARY KEY,
  sale_id    INT REFERENCES sales(id) ON DELETE CASCADE,
  amount     NUMERIC(12,2) NOT NULL,
  method     VARCHAR(30) NOT NULL,
  reference  VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refunds
CREATE TABLE IF NOT EXISTS refunds (
  id         SERIAL PRIMARY KEY,
  sale_id    INT REFERENCES sales(id) ON DELETE CASCADE,
  amount     NUMERIC(12,2) NOT NULL,
  reason     TEXT,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id         SERIAL PRIMARY KEY,
  sale_id    INT REFERENCES sales(id) ON DELETE CASCADE UNIQUE,
  receipt_no VARCHAR(50) UNIQUE NOT NULL,
  data       JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE SET NULL,
  action     VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id  INT,
  old_data   JSONB,
  new_data   JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_barcode    ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku        ON products(sku);
CREATE INDEX IF NOT EXISTS idx_sales_created_at    ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_cashier       ON sales(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale     ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_pid ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user     ON audit_logs(user_id);

-- ── Seed Default Roles ────────────────────────────────────────────────────────
INSERT INTO roles (name) VALUES
  ('owner'),
  ('manager'),
  ('cashier'),
  ('inventory_clerk')
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- New: Expenses, Shifts, Devices, and user flag for forced password change
-- ================================================================

-- Add must_change_password to users (if not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='must_change_password'
  ) THEN
    ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;
  END IF;
END$$;

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  cashier_id INT REFERENCES users(id) ON DELETE SET NULL,
  category VARCHAR(100),
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'open', -- open, closed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(200) UNIQUE NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  device_name VARCHAR(200),
  status VARCHAR(20) DEFAULT 'registered', -- registered, disabled
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_expenses_cashier    ON expenses(cashier_id);
CREATE INDEX IF NOT EXISTS idx_shifts_user         ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_deviceid    ON devices(device_id);

