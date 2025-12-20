/* jshint esversion: 8 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');

const logger = require('./logger');
const { connectToDatabase } = require('./models/db'); // MongoDB connection

// Routes
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();
const port = 3060;

// ============================
// Middleware
// ============================
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// ============================
// MongoDB Connection
// ============================
let db; // store DB connection

connectToDatabase()
  .then((database) => {
    db = database;
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });

// ============================
// Routes
// ============================
app.get('/', (req, res) => {
  res.send('Inside the server');
});

// Pass DB to secondChanceItemsRoutes
app.use('/api/secondchance/items', (req, res, next) => {
  req.db = db;
  next();
}, secondChanceItemsRoutes);

// Pass DB to searchRoutes
app.use('/api/secondchance/search', (req, res, next) => {
  req.db = db;
  next();
}, searchRoutes);

// ============================
// Global Error Handler
// ============================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ============================
// Start Server
// ============================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
