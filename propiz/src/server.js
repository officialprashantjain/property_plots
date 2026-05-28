// src/server.js
const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./db/mongoose');
const seedAdmin = require('./utils/seedAdmin');

let server;

async function start() {
  try {
    await connectDB();
    console.log('Database connected');
    await seedAdmin();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
  
  server = app.listen(env.port, () => {
    console.log(`Server running at http://localhost:${env.port}`);
  });
  
  return server;
}

start();

async function shutdown() {
  try {
    if (server) {
      await new Promise((resolve) => server.close(() => resolve()));
    }
  } catch (error) {
    console.error('Error during server shutdown:', error);
  }
  
  try {
    await disconnectDB();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
  
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);