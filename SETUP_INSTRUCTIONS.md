# E-commerce Chatbot Setup Instructions

## Database Setup

The chatbot now supports order tracking from MongoDB database. Follow these steps to set it up:

### 1. Install MongoDB (if not already installed)

**Option A: Local MongoDB**
- Download and install MongoDB Community Edition from https://www.mongodb.com/try/download/community
- Start MongoDB service on your system

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Sign up for free at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string

### 2. Create .env File

Create a `.env` file in the `backend` directory:

```env
PORT=8000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/chatbot
```

For MongoDB Atlas, use:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot
```

### 3. Seed Sample Orders

Run the seed script to add sample orders to the database:

```bash
cd backend
npm run seed
```

This will create 5 sample orders with IDs: 12345, 12346, 12347, 12348, 12349

### 4. Start the Servers

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Test the Chatbot

Open http://localhost:5173 and try these queries:
- "Where is my order #12345"
- "Track order 12346"
- "What is the status of order #12347"
- "How to return order #12345"

## Sample Orders Created

- **Order #12345**: Delivered (₹17,998)
- **Order #12346**: Shipped (₹2,598)
- **Order #12347**: Processing (₹14,999)
- **Order #12348**: Pending (₹2,999)
- **Order #12349**: Cancelled (₹16,298)

## Features

✅ Order tracking by order ID
✅ Order status lookup
✅ Return/refund information based on order status
✅ Product search
✅ Payment and EMI information

