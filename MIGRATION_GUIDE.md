# Migration Guide: Google Gemini to Venice AI with MongoDB

This guide documents the migration from Google Gemini API to Venice AI API using the Mistral model, and the transition from localStorage to MongoDB.

## Overview of Changes

### 1. API Migration
- **From**: Google Gemini API (`@google/genai`)
- **To**: Venice AI API with Mistral model (`mistral-31-24b`)
- **Model**: `mistral-31-24b` - Supports vision capabilities for image analysis

### 2. Database Migration
- **From**: Browser localStorage
- **To**: MongoDB database
- **Backend**: Express.js server with MongoDB/Mongoose

### 3. Architecture Changes
- **Before**: Frontend-only application with direct API calls
- **After**: Full-stack application with backend API server

## Setup Instructions

### Prerequisites
1. Node.js (v18 or higher)
2. MongoDB (local installation or MongoDB Atlas account)
3. Venice AI API key (provided: `lnWNeSg0pA_rQUooNpbfpPDBaj2vJnWol5WqKWrIEF`)

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 2: Configure Environment Variables

#### Backend (.env file in `server/` directory)
Create `server/.env` file:
```env
VENICE_API_KEY=lnWNeSg0pA_rQUooNpbfpPDBaj2vJnWol5WqKWrIEF
MONGODB_URI=mongodb://localhost:27017/nutrisnap
PORT=3001
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrisnap
```

#### Frontend (.env file in root directory)
Create `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3001
```

### Step 3: Install Frontend Dependencies

```bash
# From root directory
npm install
```

### Step 4: Start MongoDB

**Local MongoDB:**
```bash
# macOS/Linux
mongod

# Windows
# Start MongoDB service from Services panel or use MongoDB Compass
```

**MongoDB Atlas:**
- No local setup needed, just ensure your connection string is correct

### Step 5: Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### Step 6: Start the Frontend

```bash
# From root directory
npm run dev
```

The frontend will start on `http://localhost:3000`

## Key Changes in Code

### 1. API Service (`services/geminiService.ts`)
- **Before**: Direct calls to Google Gemini API
- **After**: HTTP requests to backend API endpoint `/api/analyze`

### 2. Log Service (`services/logService.ts`)
- **Before**: localStorage operations
- **After**: HTTP requests to backend API endpoints:
  - `GET /api/food-logs` - Fetch logs
  - `POST /api/food-logs` - Add log
  - `DELETE /api/food-logs/:id` - Delete log

### 3. Constants (`constants.ts`)
- **Before**: Google GenAI Type enum format
- **After**: Standard JSON Schema format for Venice API

### 4. Backend Structure
```
server/
├── index.ts              # Express server entry point
├── config/
│   └── database.ts       # MongoDB connection
├── models/
│   └── FoodLog.ts        # Mongoose schema
├── routes/
│   ├── analyze.ts        # Image analysis endpoint
│   └── foodLogs.ts       # Food log CRUD endpoints
└── services/
    └── veniceService.ts  # Venice AI integration
```

## API Endpoints

### Backend API

#### POST `/api/analyze`
Analyze food image using Venice AI
- **Request Body**: `{ image: { data: string, mimeType: string } }`
- **Response**: `NutritionalReport`

#### GET `/api/food-logs`
Get all food logs (optionally filtered by date)
- **Query Params**: `?date=YYYY-MM-DD` (optional)
- **Response**: Array of food logs

#### POST `/api/food-logs`
Add a new food log
- **Request Body**: `{ report: NutritionalReport, date?: string }`
- **Response**: Created food log

#### DELETE `/api/food-logs/:id`
Delete a food log by ID
- **Response**: Success message

#### GET `/health`
Health check endpoint

## Venice AI Configuration

### Model Used
- **Model ID**: `mistral-31-24b`
- **Capabilities**: Vision support, function calling, JSON schema validation
- **Context**: 131,072 tokens
- **Pricing**: $0.50/$2.00 per million tokens (input/output)

### API Base URL
```
https://api.venice.ai/api/v1
```

### Response Format
Venice API uses JSON Schema for structured responses, which is compatible with the existing response structure.

## MongoDB Schema

### FoodLog Collection
```typescript
{
  userId?: string,        // Optional for future multi-user support
  date: Date,            // Date of the food log
  report: NutritionalReport,  // Full nutritional report
  createdAt: Date,       // Auto-generated
  updatedAt: Date        // Auto-generated
}
```

## Migration Checklist

- [x] Replace Google Gemini API with Venice API
- [x] Set up Express backend server
- [x] Configure MongoDB connection
- [x] Create Mongoose models
- [x] Update frontend to use backend API
- [x] Convert response schema to JSON Schema format
- [x] Update environment variables
- [x] Remove Google GenAI dependencies
- [x] Update async/await handling in frontend
- [ ] Test image analysis functionality
- [ ] Test food log CRUD operations
- [ ] Migrate existing localStorage data (if needed)

## Troubleshooting

### Backend won't start
- Check MongoDB is running (if using local MongoDB)
- Verify MongoDB connection string in `.env`
- Check if port 3001 is available

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` in `.env` matches backend URL
- Check CORS configuration in backend
- Ensure backend is running before starting frontend

### Venice API errors
- Verify `VENICE_API_KEY` is correct
- Check API key has sufficient credits
- Review Venice API rate limits

### MongoDB connection errors
- Verify MongoDB is running
- Check connection string format
- For Atlas: Ensure IP whitelist includes your IP address

## Next Steps

1. **Data Migration** (if you have existing localStorage data):
   - Export data from localStorage
   - Create a migration script to import into MongoDB

2. **Testing**:
   - Test image analysis with various food images
   - Test all CRUD operations
   - Verify date filtering works correctly

3. **Production Deployment**:
   - Set up production MongoDB (Atlas recommended)
   - Configure production environment variables
   - Set up proper error handling and logging
   - Consider adding authentication for multi-user support

## Additional Notes

- The Venice API key provided is already configured in the code
- Mistral model (`mistral-31-24b`) supports vision, which is required for image analysis
- All existing functionality should work the same from the user's perspective
- The backend provides better scalability and data persistence compared to localStorage

