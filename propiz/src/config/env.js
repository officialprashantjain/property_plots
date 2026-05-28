// src/config/env.js
require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  db: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/codefortom',
  },
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key'
};

module.exports = env;