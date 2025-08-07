# University Dating App

A modern dating application exclusively for university students.

## Features
- University email verification (.edu only)
- Swipe-based matching system
- Real-time messaging
- Profile management
- Safety features (block/report)

## Tech Stack
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Tailwind CSS
- **Authentication**: JWT with email verification
- **Real-time**: Socket.io

## Setup Instructions

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `backend/.env` with your database URL and email credentials
3. For Gmail, enable 2FA and create an App Password

### 3. Run the Application
```bash
# Start backend (from backend folder)
npm run dev

# Start frontend (from frontend folder)
npm start
```

### 4. Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/user/potential-matches` - Get potential matches
- `POST /api/user/action` - Like/dislike user
- `POST /api/messages` - Send message

## Security Features
- University email verification
- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- Input validation
- CORS protection
