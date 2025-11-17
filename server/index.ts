import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeImage } from './routes/analyze';
import { foodLogsRouter } from './routes/foodLogs';
import { connectDB } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

