const app = require('./app');
const { PORT } = require('./config/environment');
const { testConnection } = require('./config/database');

async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log('RMS V1 server running on port ' + PORT);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
