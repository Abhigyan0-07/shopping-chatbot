# How to Run the Chatbot Project

## Quick Start Guide

### Prerequisites
- Node.js (v16 or higher) installed
- MongoDB connection (local or MongoDB Atlas)
- npm (comes with Node.js)

---

## Step-by-Step Instructions

### Step 1: Open Terminal in VS Code

1. Open VS Code
2. Open the project folder: `chatbot`
3. Open Terminal: `Ctrl + `` (backtick) or `View → Terminal`

---

### Step 2: Setup Backend

**Open Terminal 1** (or split terminal):

```bash
# Navigate to backend directory
cd backend

# Install dependencies (only needed first time)
npm install

# Create .env file (if not exists)
# Copy your MongoDB connection string
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot?retryWrites=true&w=majority
# For local MongoDB:
# MONGO_URI=mongodb://localhost:27017/chatbot

# Seed the database with sample orders (only needed first time or to reset)
npm run seed

# Start the backend server
npm start
```

**Expected Output:**
```
✓ Server running on http://localhost:8000
✓ MongoDB connected
```

**Keep this terminal open!**

---

### Step 3: Setup Frontend

**Open Terminal 2** (new terminal or split):

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (only needed first time)
npm install

# Start the frontend development server
npm run dev
```

**Expected Output:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Keep this terminal open!**

---

### Step 4: Access the Chatbot

1. Open your web browser
2. Go to: **http://localhost:5173**
3. You should see the chatbot interface

---

## Using the Chatbot

### Start a Conversation

1. Type **"hey"** in the chat input
2. You'll see: "Hi — how can I help you today?" with two buttons:
   - **"Order I placed"** - To look up your orders
   - **"General query"** - For FAQ questions

### Look Up Orders

1. Click **"Order I placed"**
2. Enter either:
   - Your email: `john.doe@example.com`
   - Your order ID: `12345` or `#12345`
3. View your orders with status and action buttons

### Ask General Questions

1. Click **"General query"**
2. Ask questions like:
   - "What is your shipping policy?"
   - "How do I return an item?"
   - "What payment methods do you accept?"

---

## Sample Test Data

After running `npm run seed` in the backend, you'll have:

**Test Emails:**
- `john.doe@example.com` - Has 3 orders
- `jane.smith@example.com` - Has 2 orders
- `bob.johnson@example.com` - Has 1 order
- `alice.williams@example.com` - Has 1 order

**Test Order IDs:**
- 12345 (Delivered)
- 12346 (Processing)
- 12347 (Processing)
- 12348 (Processing)
- 12349 (Refund)
- 12350 (Return)
- 12351 (Exchange)

---

## Troubleshooting

### Backend won't start

**Issue:** Port 8000 already in use
```bash
# Find and kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

**Issue:** MongoDB connection failed
- Check your `.env` file has correct `MONGO_URI`
- For Atlas: Ensure your IP is whitelisted
- For local: Ensure MongoDB service is running

### Frontend won't start

**Issue:** Port 5173 already in use
```bash
# Find and kill process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

**Issue:** Dependencies not installed
```bash
cd frontend
npm install
```

### Can't connect to backend

**Check:**
1. Backend server is running (check Terminal 1)
2. Backend is on port 8000
3. No firewall blocking the connection
4. Browser console (F12) for CORS errors

**Fix CORS:**
- Ensure `CLIENT_URL=http://localhost:5173` in backend `.env`
- Restart backend server after changing `.env`

---

## Commands Summary

### Backend Commands
```bash
cd backend
npm install          # Install dependencies
npm run seed         # Seed database with sample orders
npm start            # Start server
npm run dev          # Start with auto-reload (if nodemon installed)
```

### Frontend Commands
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Stopping the Servers

**To stop servers:**
1. Go to the terminal where server is running
2. Press `Ctrl + C`
3. Confirm if prompted

**Or close the terminal windows**

---

## Project Structure

```
chatbot/
├── backend/
│   ├── server.js           # Main server file
│   ├── .env                # Environment variables (create this)
│   ├── package.json
│   └── ...
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── chat.js             # API client
│   ├── style.css           # Styles
│   ├── package.json
│   └── ...
└── README.md
```

---

## Need Help?

1. Check browser console (F12) for errors
2. Check terminal output for server errors
3. Verify both servers are running on correct ports
4. Ensure MongoDB connection is working

---

## Quick Reference

| Service | Port | URL | Command |
|---------|------|-----|---------|
| Backend | 8000 | http://localhost:8000 | `cd backend && npm start` |
| Frontend | 5173 | http://localhost:5173 | `cd frontend && npm run dev` |

---

**Happy Chatting! 🚀**

