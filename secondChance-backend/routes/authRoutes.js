const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const logger = require('../logger');
const { connectToDatabase } = require('../models/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// ============================
// POST /register
// ============================
router.post('/register', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('users');
    const { email, firstName, lastName, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingEmail = await collection.findOne({ email });
    if (existingEmail) {
      logger.error('Email id already exists');
      return res.status(400).json({ error: 'Email id already exists' });
    }

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);

    const newUser = await collection.insertOne({
      email,
      firstName,
      lastName,
      password: hash,
      createdAt: new Date(),
    });

    const payload = { user: { id: newUser.insertedId } };
    const authtoken = jwt.sign(payload, JWT_SECRET);

    logger.info('User registered successfully');
    res.json({ authtoken, email });
  } catch (e) {
    logger.error(e);
    return res.status(500).send('Internal server error');
  }
});

// ============================
// POST /login
// ============================
router.post('/login', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('users');
    const { email, password } = req.body;

    const theUser = await collection.findOne({ email });
    if (!theUser) {
      logger.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcryptjs.compare(password, theUser.password);
    if (!match) {
      logger.error('Passwords do not match');
      return res.status(404).json({ error: 'Wrong password' });
    }

    const userName = theUser.firstName;
    const userEmail = theUser.email;
    const payload = { user: { id: theUser._id.toString() } };
    const authtoken = jwt.sign(payload, JWT_SECRET);

    res.json({ authtoken, userName, userEmail });
  } catch (e) {
    logger.error(e);
    return res.status(500).send('Internal server error');
  }
});

// ============================
// PUT /update
// ============================
router.put('/update', async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors in update request', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.headers.email;
    if (!email) {
      logger.error('Email not found in the request headers');
      return res.status(400).json({ error: 'Email not found in the request headers' });
    }

    const db = await connectToDatabase();
    const collection = db.collection('users');

    const existingUser = await collection.findOne({ email });
    if (!existingUser) {
      logger.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields from request body
    Object.keys(req.body).forEach(key => {
      existingUser[key] = req.body[key];
    });
    existingUser.updatedAt = new Date();

    const updatedUser = await collection.findOneAndUpdate(
      { email },
      { $set: existingUser },
      { returnDocument: 'after' }
    );

    const payload = { user: { id: updatedUser.value._id.toString() } };
    const authtoken = jwt.sign(payload, JWT_SECRET);

    res.json({ authtoken });
  } catch (e) {
    logger.error(e);
    return res.status(500).send('Internal server error');
  }
});

module.exports = router;
