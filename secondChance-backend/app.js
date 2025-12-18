/* jshint esversion: 8 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');

const logger = require('./logger');
const connectToDatabase = require('./models/db');

// Routes
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');

const app = express();
const port = 3060;

// ============================
// Middleware
// ============================
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// ============================
// Connect to MongoDB (once)
// ============================
connectToDatabase()
  .then(() => {
    logger.info('Connected to DB');
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

app.use('/api/secondchance/items', secondChanceItemsRoutes);

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
