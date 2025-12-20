const { MongoClient } = require('mongodb');

async function connectToDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in .env');
  }
  if (!process.env.MONGO_DB) {
    throw new Error('MONGO_DB is not defined in .env');
  }

  const client = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  return client.db(process.env.MONGO_DB);
}

module.exports = { connectToDatabase };
