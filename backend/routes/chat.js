// backend/routes/chat.js
import express from "express";
import { handleChatMessage } from "../services/chatService.js";

const router = express.Router();

// POST /api/chat  -> { message: "...", context: {...} }
router.post("/", async (req, res, next) => {
  try {
    const { message, context } = req.body;
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({ 
        error: "message required", 
        reply: "Please provide a valid message.",
        context: context || {}
      });
    }

    // Handle chat with context
    const response = await handleChatMessage(message, context || {});
    
    res.json(response);
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({ 
      error: err.message || "Internal server error",
      reply: "Sorry, I encountered an error processing your message. Please try again.",
      context: req.body.context || {}
    });
  }
});

export default router;
