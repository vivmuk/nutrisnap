import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrisnap';

export const connectDB = async (): Promise<void> => {
  try {
    if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/nutrisnap') {
      console.warn('MONGODB_URI not set or using default. Database operations will fail.');
      return;
    }
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('MongoDB connected successfully');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message || error);
    // Don't throw - let server continue running
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

