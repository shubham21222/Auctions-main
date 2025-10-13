// Run this script once to add indexes for faster queries
// Usage: node add_indexes.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'your_mongodb_connection_string';

async function addIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Add index on catalog field for faster grouping
    await db.collection('auctions').createIndex({ catalog: 1 });
    console.log('✅ Index created: auctions.catalog');

    // Add compound index for catalog + startDate for faster sorting
    await db.collection('auctions').createIndex({ catalog: 1, startDate: -1 });
    console.log('✅ Index created: auctions.catalog + startDate');

    // Add index on status for faster filtering
    await db.collection('auctions').createIndex({ status: 1 });
    console.log('✅ Index created: auctions.status');

    // Add index on auctionProduct for faster lookups
    await db.collection('auctions').createIndex({ auctionProduct: 1 });
    console.log('✅ Index created: auctions.auctionProduct');

    console.log('\n🎉 All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addIndexes();

