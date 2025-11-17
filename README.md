<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NutriSnap - AI Calorie Tracker

An AI-powered nutrition tracking application that analyzes food images and provides detailed nutritional information using Venice AI (Mistral model) and MongoDB.

## Features

- 📸 **Image Analysis**: Upload food images for AI-powered nutritional analysis
- 📊 **Nutrition Tracking**: Track calories, macronutrients, and micronutrients
- 📅 **Daily Dashboard**: View your daily nutrition summary and trends
- 💾 **Persistent Storage**: All data stored in MongoDB for reliability

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **AI**: Venice AI (Mistral 31-24B model with vision support)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Venice AI API key

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
# From root directory
npm install
```

### 2. Configure Environment Variables

**Backend** (`server/.env`):
```env
VENICE_API_KEY=lnWNeSg0pA_rQUooNpbfpPDBaj2vJnWol5WqKWrIEF
MONGODB_URI=mongodb://localhost:27017/nutrisnap
PORT=3001
```

**Frontend** (`.env` in root):
```env
VITE_API_BASE_URL=http://localhost:3001
```

### 3. Start MongoDB

**Option A: MongoDB Atlas (Recommended - Cloud-hosted, Free tier available)**
- See [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md) for detailed setup instructions
- After setup, use your Atlas connection string in `MONGODB_URI`

**Option B: Local MongoDB:**
```bash
# macOS/Linux
mongod

# Windows - Start MongoDB service
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Project Structure

```
nutrisnap/
├── server/                 # Backend API server
│   ├── index.ts            # Express server entry point
│   ├── config/             # Configuration files
│   │   └── database.ts     # MongoDB connection
│   ├── models/             # Mongoose models
│   │   └── FoodLog.ts      # Food log schema
│   ├── routes/             # API routes
│   │   ├── analyze.ts      # Image analysis endpoint
│   │   └── foodLogs.ts     # Food log CRUD endpoints
│   └── services/           # Business logic
│       └── veniceService.ts # Venice AI integration
├── components/             # React components
├── services/               # Frontend services
├── hooks/                  # React hooks
└── types.ts                # TypeScript type definitions
```

## API Endpoints

### POST `/api/analyze`
Analyze food image using Venice AI
- **Body**: `{ image: { data: string, mimeType: string } }`
- **Response**: `NutritionalReport`

### GET `/api/food-logs`
Get all food logs (optionally filtered by date)
- **Query**: `?date=YYYY-MM-DD` (optional)

### POST `/api/food-logs`
Add a new food log
- **Body**: `{ report: NutritionalReport, date?: string }`

### DELETE `/api/food-logs/:id`
Delete a food log by ID

## Technology Stack

This project uses Venice AI (Mistral 31-24B model) for image analysis. For migration information from other platforms, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md).

## License

MIT
