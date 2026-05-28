const express = require('express');
const mongoose = require('mongoose');
const { registerMiddlewares, userRoutes } = require('./middleware/registerMiddlewares');
const logger = require('./utils/logger');

const app = express();

app.use(express.json());

registerMiddlewares(app);
userRoutes(app);

app.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    if (dbState !== 1) throw new Error('Database not connected');
    
    logger.info('Database health check passed');
    return res.status(200).json({ ok: true, db: 'up' });
  } catch (err) {
    return res.status(503).json({ ok: false, db: 'down' });
  }
});

module.exports = app;