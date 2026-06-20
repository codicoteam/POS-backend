const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'RMS V1 - Retail Management System API',
    version: '1.0.0',
    description: 'Retail Management System V1 backend API documentation',
    contact: {
      name: 'RMS Support',
      email: 'support@rms.local',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'owner@rms.com' },
          password: { type: 'string', example: 'Admin@1234' },
        },
        required: ['email', 'password'],
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          sku: { type: 'string' },
          barcode: { type: 'string' },
          category_id: { type: 'integer' },
          cost_price: { type: 'number', format: 'float' },
          selling_price: { type: 'number', format: 'float' },
          description: { type: 'string' },
          is_active: { type: 'boolean' },
        },
      },
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          loyalty_pts: { type: 'integer' },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Authenticate a user and return a JWT token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Successful login', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current authenticated user',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Current user data' },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/password': {
      put: {
        summary: 'Change current user password',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password changed' },
          '400': { description: 'Invalid request' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role_id: { type: 'integer' },
                },
                required: ['name', 'email', 'password', 'role_id'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created' },
          '400': { description: 'Invalid request' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/users': {
      get: {
        summary: 'List all users',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'List of users' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/users/{id}': {
      put: {
        summary: 'Update user details',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role_id: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User updated' },
          '401': { description: 'Unauthorized' },
        },
      },
      delete: {
        summary: 'Deactivate a user account',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'User deactivated' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/reset-password/{id}': {
      put: {
        summary: 'Reset a user password',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  password: { type: 'string' },
                },
                required: ['password'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password reset' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/roles': {
      get: {
        summary: 'List available user roles',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Role list' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/products': {
      get: {
        summary: 'List products',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'List of products' },
        },
      },
      post: {
        summary: 'Create a product',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' },
            },
          },
        },
        responses: {
          '201': { description: 'Product created' },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        summary: 'Get product by ID',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Product retrieved' } },
      },
      put: {
        summary: 'Update product details',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' },
            },
          },
        },
        responses: { '200': { description: 'Product updated' } },
      },
      delete: {
        summary: 'Delete product',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Product deleted' } },
      },
    },
    '/api/products/barcode/{barcode}': {
      get: {
        summary: 'Get product by barcode',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'barcode', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Product retrieved' } },
      },
    },
    '/api/products/generate-barcode': {
      post: {
        summary: 'Generate product barcode PNG',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  format: { type: 'string', example: 'code128' },
                },
                required: ['value'],
              },
            },
          },
        },
        responses: { '200': { description: 'Barcode image generated' } },
      },
    },
    '/api/products/generate-barcode-svg': {
      post: {
        summary: 'Generate product barcode SVG',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  format: { type: 'string', example: 'code128' },
                },
                required: ['value'],
              },
            },
          },
        },
        responses: { '200': { description: 'Barcode SVG generated' } },
      },
    },
    '/api/products/generate-barcode-dataurl': {
      post: {
        summary: 'Generate barcode data URL',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  format: { type: 'string', example: 'code128' },
                },
                required: ['value'],
              },
            },
          },
        },
        responses: { '200': { description: 'Barcode data URL generated' } },
      },
    },
    '/api/products/categories': {
      get: {
        summary: 'List categories',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Product categories' } },
      },
      post: {
        summary: 'Create category',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string' } },
                required: ['name'],
              },
            },
          },
        },
        responses: { '201': { description: 'Category created' } },
      },
    },
    '/api/products/categories/{id}': {
      put: {
        summary: 'Update category',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } } },
        },
        responses: { '200': { description: 'Category updated' } },
      },
      delete: {
        summary: 'Delete category',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Category deleted' } },
      },
    },
    '/api/inventory': {
      get: {
        summary: 'List inventory items',
        tags: ['Inventory'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Inventory list' } },
      },
    },
    '/api/inventory/low-stock': {
      get: {
        summary: 'List low stock items',
        tags: ['Inventory'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Low stock items' } },
      },
    },
    '/api/inventory/movements/{product_id}': {
      get: {
        summary: 'Get stock movements for a product',
        tags: ['Inventory'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'product_id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Stock movements' } },
      },
    },
    '/api/inventory/adjust': {
      post: {
        summary: 'Adjust stock quantity',
        tags: ['Inventory'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  product_id: { type: 'integer' },
                  quantity: { type: 'integer' },
                  type: { type: 'string' },
                  note: { type: 'string' },
                },
                required: ['product_id', 'quantity', 'type'],
              },
            },
          },
        },
        responses: { '200': { description: 'Stock adjusted' } },
      },
    },
    '/api/inventory/threshold/{product_id}': {
      put: {
        summary: 'Set low stock threshold',
        tags: ['Inventory'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'product_id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { low_stock_threshold: { type: 'integer' } },
                required: ['low_stock_threshold'],
              },
            },
          },
        },
        responses: { '200': { description: 'Threshold updated' } },
      },
    },
    '/api/customers': {
      get: {
        summary: 'List customers',
        tags: ['Customers'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Customer list' } },
      },
      post: {
        summary: 'Create customer',
        tags: ['Customers'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Customer' },
            },
          },
        },
        responses: { '201': { description: 'Customer created' } },
      },
    },
    '/api/customers/{id}': {
      get: {
        summary: 'Get customer by ID',
        tags: ['Customers'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Customer retrieved' } },
      },
      put: {
        summary: 'Update customer details',
        tags: ['Customers'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Customer' },
            },
          },
        },
        responses: { '200': { description: 'Customer updated' } },
      },
    },
    '/api/customers/{id}/history': {
      get: {
        summary: 'Get customer purchase history',
        tags: ['Customers'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Purchase history' } },
      },
    },
    '/api/customers/{id}/stats': {
      get: {
        summary: 'Get customer statistics',
        tags: ['Customers'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Customer stats' } },
      },
    },
    '/api/sales': {
      get: {
        summary: 'List sales',
        tags: ['Sales'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Sales list' } },
      },
      post: {
        summary: 'Create a sale transaction',
        tags: ['Sales'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customer_id: { type: 'integer' },
                  cashier_id: { type: 'integer' },
                  subtotal: { type: 'number' },
                  discount: { type: 'number' },
                  total: { type: 'number' },
                  payment_method: { type: 'string' },
                  amount_tendered: { type: 'number' },
                  change_given: { type: 'number' },
                  sale_items: { type: 'array', items: { type: 'object' } },
                },
                required: ['total', 'payment_method'],
              },
            },
          },
        },
        responses: { '201': { description: 'Sale created' } },
      },
    },
    '/api/sales/{id}': {
      get: {
        summary: 'Get sale by ID',
        tags: ['Sales'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Sale retrieved' } },
      },
    },
    '/api/sales/{id}/receipt': {
      get: {
        summary: 'Get sale receipt',
        tags: ['Sales'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Receipt retrieved' } },
      },
    },
    '/api/sales/{id}/refund': {
      post: {
        summary: 'Refund a sale',
        tags: ['Sales'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number' },
                  reason: { type: 'string' },
                },
                required: ['amount'],
              },
            },
          },
        },
        responses: { '200': { description: 'Refund processed' } },
      },
    },
    '/api/reports/dashboard': {
      get: {
        summary: 'Get dashboard analytics',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Dashboard data' } },
      },
    },
    '/api/reports/daily': {
      get: {
        summary: 'Daily sales report',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Daily report' } },
      },
    },
    '/api/reports/weekly': {
      get: {
        summary: 'Weekly sales report',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Weekly report' } },
      },
    },
    '/api/reports/monthly': {
      get: {
        summary: 'Monthly sales report',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Monthly report' } },
      },
    },
    '/api/reports/inventory': {
      get: {
        summary: 'Inventory report',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Inventory report' } },
      },
    },
    '/api/reports/top-products': {
      get: {
        summary: 'Top performing products',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Top products report' } },
      },
    },
    '/api/reports/employee': {
      get: {
        summary: 'Employee performance report',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Employee performance data' } },
      },
    },
    '/api/reports/profitability': {
      get: {
        summary: 'Profitability report',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Profitability data' } },
      },
    },
    '/api/whatsapp/webhook': {
      get: {
        summary: 'WhatsApp webhook challenge verification',
        tags: ['WhatsApp'],
        responses: { '200': { description: 'Verification successful' } },
      },
      post: {
        summary: 'Receive WhatsApp webhook messages',
        tags: ['WhatsApp'],
        responses: { '200': { description: 'Webhook received' } },
      },
    },
    '/api/whatsapp/send-daily-summary': {
      post: {
        summary: 'Send the daily sales summary via WhatsApp',
        tags: ['WhatsApp'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Daily summary sent' } },
      },
    },
  },
};

function stripSchemaExamples(obj) {
  if (obj && typeof obj === 'object') {
    if (Object.prototype.hasOwnProperty.call(obj, 'example')) {
      delete obj.example;
    }
    for (const value of Object.values(obj)) {
      stripSchemaExamples(value);
    }
  }
}

function stripResponseContent(spec) {
  if (!spec.paths) return;
  for (const pathItem of Object.values(spec.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (operation && operation.responses) {
        for (const response of Object.values(operation.responses)) {
          if (response && response.content) {
            delete response.content;
          }
        }
      }
    }
  }
}

stripSchemaExamples(swaggerSpec.components);
stripResponseContent(swaggerSpec);

module.exports = swaggerSpec;
