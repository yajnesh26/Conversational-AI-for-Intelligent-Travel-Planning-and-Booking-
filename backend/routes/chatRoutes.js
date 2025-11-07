import express from "express";
import { chat, chatItinerary } from "../controllers/chatController.js";

const router = express.Router();

// 💬 General AI travel chat
router.post("/", chat);

// 🧭 Smart itinerary generator (Groq + real attractions)
router.post("/itinerary", chatItinerary);

export default router;
