// models/db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL;
const dbName = process.env.MONGO_DB;
let dbInstance = null;

async function connectToDatabase() {
    if (dbInstance) return dbInstance;

    const client = new MongoClient(url);  

    // Task 2: Connect to MongoDB
    await client.connect();

    // Task 3: Connect to the secondChance database
    dbInstance = client.db(dbName);

    // Task 4: Return database instance
    return dbInstance;
}

module.exports = connectToDatabase;
