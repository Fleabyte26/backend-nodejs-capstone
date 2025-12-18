const connectToDatabase = require("./models/db.js");

async function testConnection() {
    try {
        const db = await connectToDatabase();
        console.log("✅ Connected to MongoDB!");
        const collections = await db.collections();
        console.log("Collections:", collections.map(c => c.collectionName));
    } catch (err) {
        console.error("❌ Connection failed:", err);
    }
}

testConnection();
