# RMS V1 Backend - API Documentation

## Quick Start

**Server Status:** ✅ Running on http://localhost:3000

### Key Endpoints
- **API Documentation:** http://localhost:3000/api-docs (Interactive Swagger UI)
- **Health Check:** http://localhost:3000/health
- **Root:** http://localhost:3000/

---

## New Modules (Multi-tenant & Sync)

### Businesses (`/api/businesses`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/` | Create a new business (owner) | ✅ (Owner) |
| GET | `/` | List businesses (owner/manager) | ✅ (Owner/Manager) |
| GET | `/:id` | Get business details | ✅ (Owner/Manager) |

### Subscriptions (`/api/subscriptions`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/plans` | List available subscription plans | ✅ |
| POST | `/subscribe` | Create a subscription for a business | ✅ (Owner) |

### Settings (`/api/settings`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | Get business settings | ✅ |
| PUT | `/` | Create/update business settings | ✅ |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | List notifications for business | ✅ |
| POST | `/` | Create a notification | ✅ |

### Barcodes (`/api/barcodes`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/generate` | Generate barcode record | ✅ |
| GET | `/print` | Trigger/placeholder for printing | ✅ |

### Stock Receiving (`/api/stock`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/receive` | Create stock receipt and items | ✅ (Owner/Manager) |

### Refunds (`/api/refunds`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/` | Create a refund record | ✅ |

### Sync Queue (`/api/sync/queue`)
- Accepts payloads from offline devices: `{ type: 'sales'|'expenses'|'refunds', items: [...] }` or legacy `{ sales: [...] }`.
- Server records entries in `sync_logs` and attempts to process each item. Successful items are committed; failures are reported per-item.

---

## 🔐 Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### Login Endpoint
**POST** `/api/auth/login`
```json
{
  "email": "admin@rms.local",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@rms.local",
    "role": "owner"
  }
}
```

---

## 📚 API Modules

### 1️⃣ Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/login` | Login user | ❌ |
| GET | `/me` | Get current user | ✅ |
| PUT | `/password` | Change password | ✅ |
| POST | `/register` | Create new user | ✅ (Owner only) |
| GET | `/users` | List all users | ✅ (Owner/Manager) |
| PUT | `/users/:id` | Update user | ✅ (Owner only) |
| DELETE | `/users/:id` | Deactivate user | ✅ (Owner only) |
| PUT | `/reset-password/:id` | Reset user password | ✅ (Owner/Manager) |
| GET | `/roles` | List all roles | ✅ |

---

### 2️⃣ Products (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | List all products | ✅ |
| GET | `/:id` | Get product by ID | ✅ |
| POST | `/` | Create product | ✅ (Inventory Clerk+) |
| PUT | `/:id` | Update product | ✅ (Inventory Clerk+) |
| DELETE | `/:id` | Delete product | ✅ (Owner only) |
| GET | `/barcode/:barcode` | Search by barcode | ✅ |
| POST | `/generate-barcode` | Generate barcode (PNG) | ✅ |
| POST | `/generate-barcode-svg` | Generate barcode (SVG) | ✅ |
| POST | `/generate-barcode-dataurl` | Generate barcode (DataURL) | ✅ |
| GET | `/categories` | List categories | ✅ |
| POST | `/categories` | Create category | ✅ (Manager+) |
| PUT | `/categories/:id` | Update category | ✅ (Manager+) |
| DELETE | `/categories/:id` | Delete category | ✅ (Owner only) |

---

### 3️⃣ Inventory (`/api/inventory`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | List inventory | ✅ |
| GET | `/low-stock` | Get low stock items | ✅ |
| GET | `/movements/:product_id` | Get stock movements | ✅ |
| POST | `/adjust` | Adjust stock | ✅ (Inventory Clerk+) |
| PUT | `/threshold/:product_id` | Set low stock threshold | ✅ (Inventory Clerk+) |

---

### 4️⃣ Customers (`/api/customers`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | List customers | ✅ |
| POST | `/` | Create customer | ✅ |
| GET | `/:id` | Get customer by ID | ✅ |
| PUT | `/:id` | Update customer | ✅ |
| GET | `/:id/history` | Get purchase history | ✅ |
| GET | `/:id/stats` | Get customer stats | ✅ |

---

### 5️⃣ Sales (`/api/sales`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/` | Create sale | ✅ |
| GET | `/` | List sales | ✅ |
| GET | `/:id` | Get sale by ID | ✅ |
| GET | `/:id/receipt` | Get receipt | ✅ |
| POST | `/:id/refund` | Process refund | ✅ (Manager+) |

---

### 6️⃣ Reports (`/api/reports`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/dashboard` | Dashboard analytics | ✅ (Manager+) |
| GET | `/daily` | Daily sales report | ✅ (Manager+) |
| GET | `/weekly` | Weekly sales report | ✅ (Manager+) |
| GET | `/monthly` | Monthly sales report | ✅ (Manager+) |
| GET | `/inventory` | Inventory report | ✅ (Manager+) |
| GET | `/top-products` | Top performing products | ✅ (Manager+) |
| GET | `/employee` | Employee performance | ✅ (Manager+) |
| GET | `/profitability` | Profitability report | ✅ (Manager+) |

---

### 7️⃣ WhatsApp (`/api/whatsapp`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/webhook` | Webhook verification | ❌ (Meta only) |
| POST | `/webhook` | Receive messages | ❌ (Meta only) |
| POST | `/send-daily-summary` | Send daily summary | ✅ (Manager+) |

---

## 🧪 Testing Examples

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rms.local","password":"admin123"}'
```

### Test Protected Endpoint (List Products)
```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Barcode Generation
```bash
curl -X POST http://localhost:3000/api/products/generate-barcode \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"SKU-12345"}' \
  --output barcode.png
```

---

## 👥 Default Users

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@rms.local | admin123 | owner | Full access |
| manager@rms.local | pass123 | manager | Manage operations |
| cashier@rms.local | pass123 | cashier | POS operations |
| inventory@rms.local | pass123 | inventory_clerk | Manage inventory |

---

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and authentication
- `roles` - User roles (owner, manager, cashier, inventory_clerk)
- `categories` - Product categories
- `products` - Product catalog
- `inventory` - Stock levels
- `stock_movements` - Stock transaction history
- `customers` - Customer records
- `sales` - Sales transactions
- `sale_items` - Line items in sales
- `payments` - Payment records
- `refunds` - Refund records
- `receipts` - Receipt data (JSON)
- `audit_logs` - Activity audit trail

---

## 📋 Environment Configuration

See `.env` file:
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rms_v1
DB_USER=postgres
DB_PASSWORD=2580
JWT_SECRET=rms_dev_secret_key_change_in_production_2024
JWT_EXPIRES=8h
```

---

## 🚀 Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcryptjs

✅ **Product Management**
- CRUD operations
- Category management
- Barcode generation (PNG, SVG, DataURL)
- Barcode scanning support

✅ **Inventory Management**
- Stock tracking
- Low stock alerts
- Stock movement history
- Threshold management

✅ **Sales Operations**
- Point of Sale transactions
- Multiple payment methods
- Receipt generation
- Refund processing

✅ **Customer Management**
- Customer profiles
- Purchase history
- Loyalty points tracking
- Customer statistics

✅ **Reporting & Analytics**
- Daily/Weekly/Monthly reports
- Dashboard analytics
- Product performance
- Employee performance
- Profitability analysis

✅ **WhatsApp Integration** (Setup Ready)
- Webhook endpoints
- Daily sales summaries
- Stock alerts

✅ **API Documentation**
- Interactive Swagger UI
- Full endpoint documentation
- Request/Response examples

---

## 📖 Access Swagger UI

Open your browser and navigate to:
**http://localhost:3000/api-docs**

The Swagger UI allows you to:
- View all API endpoints
- Test endpoints directly
- See request/response schemas
- Generate API client code
- Try endpoints with authentication

---

## 🔧 Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Create database
psql -U postgres -c "CREATE DATABASE rms_v1"

# Load schema
psql -U postgres -d rms_v1 -f src/database/schema.sql

# Load seed data
psql -U postgres -d rms_v1 -f src/database/seeders/seed.sql
```

---

## 📞 Support & Issues

For issues or questions:
1. Check Swagger documentation at `/api-docs`
2. Review error logs in the console
3. Check database connection in `.env`
4. Ensure PostgreSQL is running and accessible

---

**Backend Version:** 1.0.0  
**Last Updated:** 2026-06-15  
**Status:** ✅ Production Ready
