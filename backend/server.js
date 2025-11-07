import http from "http";
import app from "./app.js";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { configEnv } from "./config/env.js";

configEnv();
const PORT = process.env.PORT || 5000;

await connectDB();

http.createServer(app).listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
