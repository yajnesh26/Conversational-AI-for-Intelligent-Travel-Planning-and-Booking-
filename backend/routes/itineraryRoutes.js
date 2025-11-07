import { Router } from "express";
import { saveTrip, myTrips } from "../controllers/itineraryController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Save the trip to DB
router.post("/save", requireAuth, saveTrip);

// Get saved trips for logged-in user
router.get("/mine", requireAuth, myTrips);

export default router;
