const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const connectToDatabase = require('../models/db');
const logger = require('../logger');

// ============================
// File upload setup
// ============================

const directoryPath = 'public/images';

// Ensure upload directory exists
if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// ============================
// GET all secondChanceItems (Step 2)
// ============================
router.get('/', async (req, res, next) => {
  logger.info('/ called');
  try {
    const db = await connectToDatabase();                         // Task 1
    const collection = db.collection('secondChanceItems');       // Task 2
    const secondChanceItems = await collection.find({}).toArray(); // Task 3
    res.json(secondChanceItems);                                  // Task 4
  } catch (e) {
    next(e);
  }
});

// ============================
// POST add new secondChanceItem (Step 3)
// ============================
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const db = await connectToDatabase();                   // Task 1
    const collection = db.collection('secondChanceItems'); // Task 2

    let secondChanceItem = req.body;                        // Task 3

    // Task 4: get last id and increment
    const lastItemQuery = await collection
      .find()
      .sort({ id: -1 })
      .limit(1);

    await lastItemQuery.forEach(item => {
      secondChanceItem.id = (parseInt(item.id) + 1).toString();
    });

    // Task 5: set date_added
    const date_added = Math.floor(new Date().getTime() / 1000);
    secondChanceItem.date_added = date_added;

    // Task 7: image upload
    if (req.file) {
      secondChanceItem.image = `/images/${req.file.originalname}`;
    }

    // Task 6: insert into DB
    await collection.insertOne(secondChanceItem);

    res.status(201).json(secondChanceItem);
  } catch (e) {
    next(e);
  }
});

// ============================
// GET secondChanceItem by ID (Step 4)
// ============================
router.get('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();                   // Task 1
    const collection = db.collection('secondChanceItems'); // Task 2

    const id = req.params.id;
    const secondChanceItem = await collection.findOne({ id }); // Task 3

    if (!secondChanceItem) {                                // Task 4
      return res.status(404).send('secondChanceItem not found');
    }

    res.json(secondChanceItem);
  } catch (e) {
    next(e);
  }
});

// ============================
// PUT update secondChanceItem (Step 5)
// ============================
router.put('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();                   // Task 1
    const collection = db.collection('secondChanceItems'); // Task 2
    const id = req.params.id;

    const secondChanceItem = await collection.findOne({ id }); // Task 3
    if (!secondChanceItem) {
      logger.error('secondChanceItem not found');
      return res.status(404).json({ error: 'secondChanceItem not found' });
    }

    // Task 4: update fields
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

    // Task 5: confirmation
    if (updateSecondChanceItem) {
      res.json({ uploaded: 'success' });
    } else {
      res.json({ uploaded: 'failed' });
    }
  } catch (e) {
    next(e);
  }
});

// ============================
// DELETE secondChanceItem (Step 6)
// ============================
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();                   // Task 1
    const collection = db.collection('secondChanceItems'); // Task 2
    const id = req.params.id;

    const secondChanceItem = await collection.findOne({ id }); // Task 3
    if (!secondChanceItem) {
      logger.error('secondChanceItem not found');
      return res.status(404).json({ error: 'secondChanceItem not found' });
    }

    await collection.deleteOne({ id });                     // Task 4
    res.json({ deleted: 'success' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
