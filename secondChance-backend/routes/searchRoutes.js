const express = require('express');
const router = express.Router();

// GET /api/secondchance/search
router.get('/', async (req, res) => {
  try {
    const db = req.db; // passed from app.js
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    const collection = db.collection(process.env.MONGO_COLLECTION);

    // Build query
    const query = {};

    if (req.query.name && req.query.name.trim() !== '') {
      query.name = { $regex: req.query.name, $options: 'i' };
    }

    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.condition) {
      query.condition = req.query.condition;
    }
    if (req.query.age_years) {
      query.age_years = { $lte: parseInt(req.query.age_years) };
    }

    const items = await collection.find(query).toArray();
    res.json(items);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

module.exports = router;
