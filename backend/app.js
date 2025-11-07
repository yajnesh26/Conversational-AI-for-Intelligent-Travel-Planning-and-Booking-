import express from "express";
import cors from "cors";
import morgan from "morgan";
import { configEnv } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import itineraryRoutes from "./routes/itineraryRoutes.js";

configEnv();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ ok: true, service: "travel-ai-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// app.use("/api/itinerary", itineraryRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

export default app;
