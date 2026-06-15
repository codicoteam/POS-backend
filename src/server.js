const app = require('./app');
const { PORT } = require('./config/environment');
const { testConnection } = require('./config/database');

async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log('RMS V1 server running on port ' + PORT);
    console.log('API root: http://localhost:' + PORT + '/');
    console.log('Health check: http://localhost:' + PORT + '/health');
    console.log('Swagger docs: http://localhost:' + PORT + '/api-docs');
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
