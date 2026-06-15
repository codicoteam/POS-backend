require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'rms_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const seed = async () => {
  const client = await pool.connect();
  try {
    const hash = await bcrypt.hash('password123', 12);

    // Demo users
    const users = [
      { name: 'Admin Owner',     email: 'owner@rms.com',   role: 'owner' },
      { name: 'Store Manager',   email: 'manager@rms.com', role: 'manager' },
      { name: 'Cashier One',     email: 'cashier@rms.com', role: 'cashier' },
      { name: 'Inventory Clerk', email: 'clerk@rms.com',   role: 'inventory_clerk' },
    ];

    for (const u of users) {
      const role = await client.query('SELECT id FROM roles WHERE name=$1', [u.role]);
      await client.query(
        `INSERT INTO users (name, email, password_hash, role_id) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING`,
        [u.name, u.email, hash, role.rows[0].id]
      );
    }
    console.log('✅ Users seeded');

    // Demo categories
    const categories = ['Groceries', 'Beverages', 'Household', 'Personal Care', 'Electronics', 'Clothing'];
    for (const c of categories) {
      await client.query(`INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [c]);
    }
    console.log('✅ Categories seeded');

    // Demo products
    const catResult = await client.query('SELECT id, name FROM categories');
    const catMap = Object.fromEntries(catResult.rows.map(r => [r.name, r.id]));

    const products = [
      { name: 'Bread (White)',       sku: 'GR001', barcode: '6001001001', cost: 1.20, price: 1.80, stock: 50, cat: 'Groceries' },
      { name: 'Milk (1L)',           sku: 'GR002', barcode: '6001001002', cost: 0.90, price: 1.40, stock: 30, cat: 'Groceries' },
      { name: 'Rice (2kg)',          sku: 'GR003', barcode: '6001001003', cost: 2.50, price: 3.80, stock: 100, cat: 'Groceries' },
      { name: 'Coca-Cola (500ml)',   sku: 'BV001', barcode: '6001002001', cost: 0.60, price: 1.00, stock: 200, cat: 'Beverages' },
      { name: 'Orange Juice (1L)',   sku: 'BV002', barcode: '6001002002', cost: 1.10, price: 1.80, stock: 40, cat: 'Beverages' },
      { name: 'Mineral Water (1L)', sku: 'BV003', barcode: '6001002003', cost: 0.30, price: 0.60, stock: 150, cat: 'Beverages' },
      { name: 'Dishwashing Liquid', sku: 'HH001', barcode: '6001003001', cost: 1.00, price: 1.80, stock: 60, cat: 'Household' },
      { name: 'Laundry Detergent',  sku: 'HH002', barcode: '6001003002', cost: 3.50, price: 5.50, stock: 25, cat: 'Household' },
      { name: 'Toothpaste',         sku: 'PC001', barcode: '6001004001', cost: 0.80, price: 1.50, stock: 80, cat: 'Personal Care' },
      { name: 'Shampoo (400ml)',     sku: 'PC002', barcode: '6001004002', cost: 1.50, price: 2.80, stock: 3,  cat: 'Personal Care' },
    ];

    for (const p of products) {
      const prod = await client.query(
        `INSERT INTO products (name, sku, barcode, cost_price, selling_price, reorder_level, category_id, unit)
         VALUES ($1,$2,$3,$4,$5,5,$6,'piece') ON CONFLICT (sku) DO NOTHING RETURNING id`,
        [p.name, p.sku, p.barcode, p.cost, p.price, catMap[p.cat]]
      );
      if (prod.rows.length) {
        await client.query(
          `INSERT INTO inventory (product_id, quantity) VALUES ($1,$2) ON CONFLICT (product_id) DO NOTHING`,
          [prod.rows[0].id, p.stock]
        );
      }
    }
    console.log('✅ Products seeded');

    // Demo customers
    const customers = [
      { name: 'John Moyo',    phone: '+263771000001', email: 'john@example.com' },
      { name: 'Mary Dube',    phone: '+263771000002', email: 'mary@example.com' },
      { name: 'Peter Ncube',  phone: '+263771000003', email: null },
    ];
    for (const c of customers) {
      await client.query(
        `INSERT INTO customers (name, phone, email) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [c.name, c.phone, c.email]
      );
    }
    console.log('✅ Customers seeded');

    console.log('\n🎉 Seed complete!');
    console.log('\nDemo login credentials:');
    console.log('  owner@rms.com    / password123  (Owner)');
    console.log('  manager@rms.com  / password123  (Manager)');
    console.log('  cashier@rms.com  / password123  (Cashier)');
    console.log('  clerk@rms.com    / password123  (Inventory Clerk)');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
