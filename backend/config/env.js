import dotenv from "dotenv";
export const configEnv = () => {
  const loaded = dotenv.config();
  if (loaded.error) console.warn("⚠️ No .env found; using defaults where possible.");
};
