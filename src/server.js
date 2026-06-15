const app = require('./app');
const { PORT } = require('./config/environment');
const { testConnection } = require('./config/database');

async function startServer() {
  await testConnection();

  const server = app.listen(PORT, () => {
    console.log('RMS V1 server running on port ' + PORT);
    console.log('API root: http://localhost:' + PORT + '/');
    console.log('Health check: http://localhost:' + PORT + '/health');
    console.log('Swagger docs: http://localhost:' + PORT + '/api-docs');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or set a different PORT in your environment.`);
      process.exit(1);
    }
    throw err;
  });
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer().catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
