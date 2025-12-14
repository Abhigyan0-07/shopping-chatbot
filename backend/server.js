// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import chatRouter from "./routes/chat.js";
import ordersRouter from "./routes/orders.js";

dotenv.config();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
// Configure Helmet to allow API requests
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// Allow frontend - CORS must be before routes
const CLIENT = process.env.CLIENT_URL || "http://localhost:5173";
console.log("CORS allowed from:", CLIENT);

// CORS configuration - allow all localhost ports (5173-5180 range for Vite)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port (for development)
    const allowedOrigins = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      CLIENT
    ].filter(Boolean);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return origin === pattern;
      } else if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


/* ---------------- PORT ---------------- */
const PORT = process.env.PORT || 8000;

/* ---------------- MONGODB MODELS ---------------- */
const participantSchema = new mongoose.Schema({
  bibId: { type: String, required: true, unique: true },
  name: String,
  startTime: Date,
  finishTime: Date,
  createdAt: { type: Date, default: Date.now }
});

const Participant = mongoose.model("Participant", participantSchema);

function runtimeSeconds(p) {
  if (!p.startTime || !p.finishTime) return null;
  return (new Date(p.finishTime) - new Date(p.startTime)) / 1000;
}

/* ---------------- RACE ROUTES ---------------- */

app.post("/api/participants/start", async (req, res) => {
  try {
    const { bibId, name } = req.body;
    if (!bibId) return res.status(400).json({ message: "bibId required" });

    let p = await Participant.findOne({ bibId });

    if (!p) {
      p = new Participant({ bibId, name, startTime: new Date() });
      await p.save();
      return res.status(201).json({ message: "Start recorded", participant: p });
    }

    if (!p.startTime) {
      p.startTime = new Date();
      if (name) p.name = name;
      await p.save();
      return res.json({ message: "Start recorded", participant: p });
    }

    res.json({ message: "Start already recorded", participant: p });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/participants/finish", async (req, res) => {
  try {
    const { bibId } = req.body;
    if (!bibId) return res.status(400).json({ message: "bibId required" });

    const p = await Participant.findOne({ bibId });
    if (!p) return res.status(404).json({ message: "Participant not found" });
    if (!p.startTime) return res.status(400).json({ message: "Start not recorded" });

    if (!p.finishTime) {
      p.finishTime = new Date();
      await p.save();
    }

    res.json({ message: "Finish recorded", participant: p, runtimeSec: runtimeSeconds(p) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

/* ---------------- CHATBOT ROUTES ---------------- */
app.use("/api/chat", chatRouter);

/* ---------------- ORDER ROUTES ---------------- */
app.use("/api/orders", ordersRouter);

/* ---------------- ERROR HANDLING ---------------- */
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal server error",
    reply: "Sorry, I encountered an error. Please try again." 
  });
});

/* ---------------- START SERVER ---------------- */

async function start() {
  // Start server first, then try to connect MongoDB
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });

  // Try to connect MongoDB (non-blocking)
  const uri = process.env.MONGO_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      });
      console.log("✓ MongoDB connected");
    } catch (err) {
      console.warn("⚠ MongoDB connection failed:", err.message);
      console.log("⚠ Server running without database - chatbot will work but order tracking requires MongoDB");
      console.log("   To fix: Make sure MongoDB is running or update MONGO_URI in .env file");
    }
  } else {
    console.log("ℹ MongoDB URI not provided - running without database");
    console.log("   Chatbot will work, but order tracking requires MongoDB connection");
  }
}

start();
