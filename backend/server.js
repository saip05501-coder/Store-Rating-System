'use strict';

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`\n🚀  Server running in ${NODE_ENV} mode`);
  console.log(`📡  Listening on http://localhost:${PORT}`);
  console.log(`🔗  API base: http://localhost:${PORT}/api\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

module.exports = server;
