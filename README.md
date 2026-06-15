# RMS V1 — Backend API

Node.js · Express · PostgreSQL backend for the Retail Management System Version 1.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — fill in your DB credentials and a strong JWT_SECRET
```

### 3. Create the database
```bash
psql -U postgres -c "CREATE DATABASE rms_v1"
```

### 4. Run the schema + seed
```bash
psql -U postgres -d rms_v1 -f src/database/schema.sql
psql -U postgres -d rms_v1 -f src/database/seeders/seed.sql
```

### 5. Start the server
```bash
npm run dev    # development (hot-reload via nodemon)
npm start      # production
```

Server starts at: `http://localhost:3000`
Health check:     `GET /health`

---

## Default Login (after seeding)

| Field    | Value           |
|----------|-----------------|
| Email    | owner@rms.com   |
| Password | Admin@1234      |

---

## API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

### Auth  `/api/auth`

| Method | Endpoint                  | Auth        | Description               |
|--------|---------------------------|-------------|---------------------------|
| POST   | /login                    | Public      | Login, returns JWT        |
| GET    | /me                       | Any role    | Get current user profile  |
| PUT    | /password                 | Any role    | Change own password       |
| POST   | /register                 | Owner       | Create a new user         |
| GET    | /users                    | Owner/Mgr   | List all users            |
| PUT    | /users/:id                | Owner       | Update user               |
| DELETE | /users/:id                | Owner       | Deactivate user           |
| PUT    | /reset-password/:id       | Owner/Mgr   | Reset another user's pwd  |
| GET    | /roles                    | Any role    | List roles                |

### Products  `/api/products`

| Method | Endpoint                  | Auth              | Description               |
|--------|---------------------------|-------------------|---------------------------|
| GET    | /                         | Any role          | List products (paginated) |
| GET    | /:id                      | Any role          | Get product by ID         |
| GET    | /barcode/:barcode         | Any role          | Lookup by barcode (POS)   |
| POST   | /                         | Owner/Mgr/Clerk   | Create product            |
| PUT    | /:id                      | Owner/Mgr/Clerk   | Update product            |
| DELETE | /:id                      | Owner             | Soft-delete product       |
| GET    | /categories               | Any role          | List categories           |
| POST   | /categories               | Owner/Mgr         | Create category           |
| PUT    | /categories/:id           | Owner/Mgr         | Update category           |
| DELETE | /categories/:id           | Owner             | Delete category           |

Query params: `?search=&category_id=&page=1&limit=50`

### Inventory  `/api/inventory`

| Method | Endpoint                      | Auth            | Description               |
|--------|-------------------------------|-----------------|---------------------------|
| GET    | /                             | Any role        | Full inventory list       |
| GET    | /low-stock                    | Any role        | Low stock items           |
| GET    | /movements/:product_id        | Any role        | Stock movement history    |
| POST   | /adjust                       | Owner/Mgr/Clerk | Adjust stock quantity     |
| PUT    | /threshold/:product_id        | Owner/Mgr/Clerk | Set low-stock threshold   |

### Customers  `/api/customers`

| Method | Endpoint              | Auth     | Description              |
|--------|-----------------------|----------|--------------------------|
| GET    | /                     | Any role | List customers           |
| POST   | /                     | Any role | Register customer        |
| GET    | /:id                  | Any role | Get customer             |
| PUT    | /:id                  | Any role | Update customer          |
| GET    | /:id/history          | Any role | Purchase history         |
| GET    | /:id/stats            | Any role | Lifetime stats           |

Query params: `?search=`

### Sales  `/api/sales`

| Method | Endpoint              | Auth          | Description              |
|--------|-----------------------|---------------|--------------------------|
| POST   | /                     | Any role      | Process a sale           |
| GET    | /                     | Any role      | List sales               |
| GET    | /:id                  | Any role      | Get sale + items         |
| GET    | /:id/receipt          | Any role      | Text + JSON receipt      |
| POST   | /:id/refund           | Owner/Mgr     | Process refund           |

Query params: `?from=&to=&cashier_id=&status=&page=1&limit=50`

#### Create Sale — Request Body
```json
{
  "customer_id": 1,
  "payment_method": "cash",
  "discount": 2.00,
  "amount_tendered": 50.00,
  "items": [
    { "product_id": 3, "quantity": 2, "unit_price": 19.99 }
  ]
}
```

### Reports  `/api/reports`  (Owner / Manager only)

| Method | Endpoint          | Description                         |
|--------|-------------------|-------------------------------------|
| GET    | /dashboard        | Today's KPIs + 7-day revenue trend  |
| GET    | /daily            | Daily sales breakdown `?date=`      |
| GET    | /weekly           | Weekly sales `?date=`               |
| GET    | /monthly          | Monthly sales `?year=&month=`       |
| GET    | /inventory        | Inventory valuation report          |
| GET    | /top-products     | Best sellers `?from=&to=&limit=`    |
| GET    | /employee         | Cashier performance `?from=&to=`    |
| GET    | /profitability    | Gross profit by product `?from=&to=`|

### WhatsApp  `/api/whatsapp`

| Method | Endpoint              | Auth      | Description                 |
|--------|-----------------------|-----------|-----------------------------|
| GET    | /webhook              | Public    | Meta webhook verification   |
| POST   | /webhook              | Public    | Incoming WhatsApp messages  |
| POST   | /send-daily-summary   | Owner/Mgr | Manually push daily summary |

#### Supported WhatsApp Commands (sent by the business owner)
- `sales today` — today's revenue and transaction count
- `top products` — top 5 products today
- `low stock` — items below threshold
- `monthly` / `this month` — month-to-date revenue

---

## Project Structure

```
rms-v1/
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── server.js
    ├── app.js
    ├── config/
    │   ├── database.js
    │   └── environment.js
    ├── database/
    │   ├── schema.sql
    │   └── seeders/
    │       └── seed.sql
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── roleMiddleware.js
    │   ├── errorHandler.js
    │   └── validate.js
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Category.js
    │   ├── Inventory.js
    │   ├── Customer.js
    │   └── Sale.js
    ├── controllers/
    │   ├── authController.js
    │   ├── productController.js
    │   ├── inventoryController.js
    │   ├── customerController.js
    │   ├── salesController.js
    │   ├── reportController.js
    │   └── whatsappController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   ├── inventoryRoutes.js
    │   ├── customerRoutes.js
    │   ├── salesRoutes.js
    │   ├── reportRoutes.js
    │   └── whatsappRoutes.js
    └── services/
        ├── reportService.js
        ├── receiptService.js
        └── whatsappService.js
```

---

## Role Permissions Summary

| Feature              | Owner | Manager | Cashier | Inventory Clerk |
|----------------------|-------|---------|---------|-----------------|
| Login                | ✅    | ✅      | ✅      | ✅              |
| Process Sales        | ✅    | ✅      | ✅      | ✅              |
| View Reports         | ✅    | ✅      | ❌      | ❌              |
| Manage Products      | ✅    | ✅      | ❌      | ✅              |
| Adjust Inventory     | ✅    | ✅      | ❌      | ✅              |
| Manage Users         | ✅    | ❌      | ❌      | ❌              |
| Process Refunds      | ✅    | ✅      | ❌      | ❌              |
| Delete Products      | ✅    | ❌      | ❌      | ❌              |
