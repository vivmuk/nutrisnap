#!/usr/bin/env node

/**
 * MongoDB Connection Validator
 * 
 * Quick script to test your MongoDB Atlas connection
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const serverDir = join(rootDir, 'server');

// Use require for mongoose since it's in server/node_modules
const require = createRequire(import.meta.url);
const mongoosePath = join(serverDir, 'node_modules', 'mongoose');
const mongoose = require(mongoosePath);

// Load .env file manually
const envPath = join(serverDir, '.env');
let MONGODB_URI = process.env.MONGODB_URI;

if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('MONGODB_URI=')) {
      // Handle the case where = might appear in the connection string
      const parts = line.split('=');
      if (parts.length > 1) {
        // Join everything after the first = to handle connection strings with = in them
        MONGODB_URI = parts.slice(1).join('=').trim();
      }
      break;
    }
  }
}

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in server/.env');
  console.error('   Please run: node scripts/setup-atlas.js');
  process.exit(1);
}

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  console.log(`Connection string: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}\n`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connection successful!');
    console.log('   Database:', mongoose.connection.db.databaseName);
    console.log('   Host:', mongoose.connection.host);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Collections: ${collections.length}`);
    
    await mongoose.disconnect();
    console.log('\n✨ MongoDB Atlas is configured correctly!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nCommon issues:');
    console.error('  • IP address not whitelisted in Atlas');
    console.error('  • Incorrect username or password');
    console.error('  • Network connectivity issues');
    console.error('  • Cluster is still being created');
    console.error('  • Connection string format is incorrect\n');
    process.exit(1);
  }
}

testConnection();

