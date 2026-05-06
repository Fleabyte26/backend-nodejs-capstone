/* jshint esversion: 8 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const natural = require('natural'); // NLP requirement (Q8)

const logger = require('./logger');
const { connectToDatabase } = require('./models/db'); // MongoDB connection

// Routes
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');
const searchRoutes = require('./routes/searchRoutes');
const sentimentRoutes = require('./routes/sentimentRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3060;

// ============================
// Middleware
// ============================
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// ============================
// MongoDB Connection (FIXED FLOW)
// ============================
let db;

// IMPORTANT FIX:
// Start server ONLY after DB connection is successful
connectToDatabase()
  .then((database) => {
    db = database;
    logger.info('Connected to MongoDB');

    // ============================
    // Start Server ONLY after DB is ready
    // ============================
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB:', err);
    process.exit(1); // prevent unstable partial server
  });

// ============================
// Routes
// ============================
app.get('/', (req, res) => {
  res.send('Inside the server');
});

// Items routes (require DB)
app.use(
  '/api/secondchance/items',
  (req, res, next) => {
    if (!db) {
      return res.status(503).json({ message: 'Database unavailable' });
    }
    req.db = db;
    next();
  },
  secondChanceItemsRoutes
);

// Search routes (require DB)
app.use(
  '/api/secondchance/search',
  (req, res, next) => {
    if (!db) {
      return res.status(503).json({ message: 'Database unavailable' });
    }
    req.db = db;
    next();
  },
  searchRoutes
);

// Auth routes (require DB)
app.use(
  '/api/auth',
  (req, res, next) => {
    if (!db) {
      return res.status(503).json({ message: 'Database unavailable' });
    }
    req.db = db;
    next();
  },
  authRoutes
);

// Sentiment routes (NO DB REQUIRED)
app.use('/api/secondchance/sentiment', sentimentRoutes);

// ============================
// Global Error Handler
// ============================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});
