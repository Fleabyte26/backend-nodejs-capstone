/* jshint esversion: 8 */
const express = require('express');
const router = express.Router();
const logger = require('../logger'); // ensure you have your logger
const { connectToDatabase } = require('../models/db'); // MongoDB connection
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// ============================
// GET all secondChanceItems
// ============================
router.get('/', async (req, res, next) => {
  try {
    const db = req.db || await connectToDatabase(); // use req.db if available
    const collectionName = process.env.MONGO_COLLECTION || 'secondChanceItems';
    const dbName = process.env.MONGO_DB || 'secondChance';

    const items = await db.db(dbName).collection(collectionName).find({}).toArray();

    res.json(items);
  } catch (err) {
    console.error('Mongo fetch error:', err);
    logger.error('Mongo fetch error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ============================
// POST add new secondChanceItem
// ============================
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('secondChanceItems');

    let secondChanceItem = req.body;

    const lastItemQuery = await collection.find().sort({ id: -1 }).limit(1);
    await lastItemQuery.forEach(item => {
      secondChanceItem.id = (parseInt(item.id) + 1).toString();
    });

    secondChanceItem.date_added = Math.floor(new Date().getTime() / 1000);

    if (req.file) {
      secondChanceItem.image = `/images/${req.file.originalname}`;
    }

    await collection.insertOne(secondChanceItem);

    res.status(201).json(secondChanceItem);
  } catch (e) {
    console.error('POST error:', e);
    next(e);
  }
});

// ============================
// GET secondChanceItem by ID
// ============================
router.get('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('secondChanceItems');

    const id = req.params.id;
    const secondChanceItem = await collection.findOne({ id });

    if (!secondChanceItem) {
      return res.status(404).send('secondChanceItem not found');
    }

    res.json(secondChanceItem);
  } catch (e) {
    console.error('GET by ID error:', e);
    next(e);
  }
});

// ============================
// PUT update secondChanceItem
// ============================
router.put('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('secondChanceItems');
    const id = req.params.id;

    const secondChanceItem = await collection.findOne({ id });
    if (!secondChanceItem) {
      logger.error('secondChanceItem not found');
      return res.status(404).json({ error: 'secondChanceItem not found' });
    }

    secondChanceItem.category = req.body.category;
    secondChanceItem.condition = req.body.condition;
    secondChanceItem.age_days = req.body.age_days;
    secondChanceItem.description = req.body.description;
    secondChanceItem.age_years = Number((secondChanceItem.age_days / 365).toFixed(1));
    secondChanceItem.updatedAt = new Date();

    const updateSecondChanceItem = await collection.findOneAndUpdate(
      { id },
      { $set: secondChanceItem },
      { returnDocument: 'after' }
    );

    if (updateSecondChanceItem) {
      res.json({ uploaded: 'success' });
    } else {
      res.json({ uploaded: 'failed' });
    }
  } catch (e) {
    console.error('PUT error:', e);
    next(e);
  }
});

// ============================
// DELETE secondChanceItem
// ============================
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('secondChanceItems');
    const id = req.params.id;

    const secondChanceItem = await collection.findOne({ id });
    if (!secondChanceItem) {
      logger.error('secondChanceItem not found');
      return res.status(404).json({ error: 'secondChanceItem not found' });
    }

    await collection.deleteOne({ id });
    res.json({ deleted: 'success' });
  } catch (e) {
    console.error('DELETE error:', e);
    next(e);
  }
});

module.exports = router;
