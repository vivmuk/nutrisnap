import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeImage } from './routes/analyze.js';
import { foodLogsRouter } from './routes/foodLogs.js';
import { connectDB } from './config/database.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/analyze', analyzeImage);
app.use('/api/food-logs', foodLogsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NutriSnap API is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NutriSnap API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      analyze: '/api/analyze',
      foodLogs: '/api/food-logs'
    }
  });
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Start server immediately, connect to MongoDB in background
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  // Connect to MongoDB (non-blocking)
  connectDB().catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    console.error('Server will continue running but database operations will fail');
  });
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

