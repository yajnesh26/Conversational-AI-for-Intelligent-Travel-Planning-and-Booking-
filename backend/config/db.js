import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI not set");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      ssl: true, // ✅ explicitly enable SSL/TLS
      tlsAllowInvalidCertificates: true, // ✅ helps on Windows with certain OpenSSL builds
    });

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};
