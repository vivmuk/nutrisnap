#!/usr/bin/env node

/**
 * Quick configuration script for MongoDB Atlas
 * This will create/update the server/.env file
 */

import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const envPath = join(rootDir, 'server', '.env');

// Your MongoDB Atlas connection string (with database name added)
const MONGODB_URI = 'mongodb+srv://blueeyesmoki_db_user:Ua9kVA8vdGUl72vZ@cluster0.lriesmr.mongodb.net/nutrisnap?retryWrites=true&w=majority';

const envContent = `VENICE_API_KEY=lnWNeSg0pA_rQUooNpbfpPDBaj2vJnWol5WqKWrIEF
MONGODB_URI=${MONGODB_URI}
PORT=3001
`;

try {
  writeFileSync(envPath, envContent);
  console.log('✅ Successfully created server/.env file');
  console.log('   MongoDB Atlas connection configured');
  console.log('   Database: nutrisnap');
  console.log('\n📋 Next steps:');
  console.log('   1. Test connection: npm run test-mongodb');
  console.log('   2. Start backend: cd server && npm run dev');
  console.log('   3. Start frontend: npm run dev\n');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📝 Please manually create server/.env with:');
  console.log(envContent);
}

