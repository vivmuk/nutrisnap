#!/usr/bin/env node

/**
 * MongoDB Atlas Setup Helper Script
 * 
 * This script helps configure your MongoDB Atlas connection after you've
 * created your cluster and obtained the connection string.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const serverDir = join(rootDir, 'server');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function validateConnectionString(uri) {
  // Basic validation
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    return false;
  }
  if (!uri.includes('@') || !uri.includes('.mongodb.net')) {
    return false;
  }
  return true;
}

async function main() {
  console.log('\n🚀 MongoDB Atlas Setup Helper\n');
  console.log('This script will help you configure your MongoDB Atlas connection.\n');
  console.log('Prerequisites:');
  console.log('  ✓ You have created a MongoDB Atlas account');
  console.log('  ✓ You have created a cluster');
  console.log('  ✓ You have created a database user');
  console.log('  ✓ You have whitelisted your IP address');
  console.log('  ✓ You have your connection string ready\n');

  const proceed = await question('Do you have all of the above? (yes/no): ');
  if (proceed.toLowerCase() !== 'yes') {
    console.log('\n📖 Please follow the guide in MONGODB_ATLAS_SETUP.md first.');
    console.log('   Then run this script again.\n');
    rl.close();
    return;
  }

  // Get connection string
  console.log('\n📋 Connection String Setup\n');
  console.log('Your connection string should look like:');
  console.log('mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nutrisnap?retryWrites=true&w=majority\n');
  
  const connectionString = await question('Enter your MongoDB Atlas connection string: ');
  
  if (!validateConnectionString(connectionString.trim())) {
    console.log('\n❌ Invalid connection string format.');
    console.log('   Make sure it starts with mongodb:// or mongodb+srv://');
    console.log('   and includes your credentials and cluster URL.\n');
    rl.close();
    return;
  }

  // Check if .env exists
  const envPath = join(serverDir, '.env');
  const envExamplePath = join(serverDir, '.env.example');
  
  let envContent = '';
  
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
    console.log('\n⚠️  .env file already exists. Updating MONGODB_URI...\n');
  } else {
    // Read from example if it exists
    if (existsSync(envExamplePath)) {
      envContent = readFileSync(envExamplePath, 'utf-8');
    } else {
      // Create default .env content
      envContent = `VENICE_API_KEY=lnWNeSg0pA_rQUooNpbfpPDBaj2vJnWol5WqKWrIEF
MONGODB_URI=
PORT=3001
`;
    }
  }

  // Update or add MONGODB_URI
  const lines = envContent.split('\n');
  let found = false;
  const updatedLines = lines.map(line => {
    if (line.startsWith('MONGODB_URI=')) {
      found = true;
      return `MONGODB_URI=${connectionString.trim()}`;
    }
    return line;
  });

  if (!found) {
    // Add MONGODB_URI if it doesn't exist
    updatedLines.push(`MONGODB_URI=${connectionString.trim()}`);
  }

  // Write updated .env
  writeFileSync(envPath, updatedLines.join('\n'));
  console.log('✅ Updated server/.env with your MongoDB Atlas connection string\n');

  // Test connection (optional)
  const testConnection = await question('Would you like to test the connection? (yes/no): ');
  if (testConnection.toLowerCase() === 'yes') {
    console.log('\n🔍 Testing connection...\n');
    console.log('Note: Make sure you have installed backend dependencies first:');
    console.log('  cd server && npm install\n');
    
    try {
      // Check if mongoose is available
      const mongoosePath = join(serverDir, 'node_modules', 'mongoose');
      if (!existsSync(mongoosePath)) {
        console.log('⚠️  Mongoose not found. Please install dependencies first:');
        console.log('   cd server && npm install\n');
      } else {
        // Dynamic import for testing
        const mongoose = await import('mongoose');
        await mongoose.default.connect(connectionString.trim());
        console.log('✅ Connection successful! MongoDB Atlas is configured correctly.\n');
        await mongoose.default.disconnect();
      }
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('\nCommon issues:');
      console.log('  • IP address not whitelisted in Atlas');
      console.log('  • Incorrect username or password');
      console.log('  • Network connectivity issues');
      console.log('  • Cluster is still being created');
      console.log('  • Backend dependencies not installed (run: cd server && npm install)\n');
    }
  }

  console.log('✨ Setup complete!\n');
  console.log('Next steps:');
  console.log('  1. Start your backend server: cd server && npm run dev');
  console.log('  2. Start your frontend: npm run dev');
  console.log('  3. Test the application\n');
  
  rl.close();
}

main().catch(console.error);

