const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes      = require('./routes/authRoutes');
const productRoutes   = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes  = require('./routes/customerRoutes');
const salesRoutes     = require('./routes/salesRoutes');
const reportRoutes    = require('./routes/reportRoutes');
const whatsappRoutes  = require('./routes/whatsappRoutes');
const expensesRoutes  = require('./routes/expensesRoutes');
const shiftsRoutes    = require('./routes/shiftsRoutes');
const devicesRoutes   = require('./routes/devicesRoutes');
const syncRoutes      = require('./routes/syncRoutes');
const businessRoutes  = require('./routes/businessRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const settingsRoutes  = require('./routes/settingsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const barcodeRoutes   = require('./routes/barcodeRoutes');
const stockRoutes     = require('./routes/stockRoutes');
const refundsRoutes   = require('./routes/refundsRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, { 
  swaggerOptions: { persistAuthorization: true } 
}));

// Root endpoint
app.get('/', (req, res) => res.json({ message: 'RMS V1 API', docs: '/api-docs' }));

app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales',     salesRoutes);
app.use('/api/reports',   reportRoutes);
app.use('/api/whatsapp',  whatsappRoutes);
app.use('/api/expenses',  expensesRoutes);
app.use('/api/shifts',    shiftsRoutes);
app.use('/api/devices',   devicesRoutes);
app.use('/api/sync',      syncRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/barcodes', barcodeRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/refunds', refundsRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route ' + req.originalUrl + ' not found' }));
app.use(errorHandler);

module.exports = app;
