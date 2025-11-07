import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["hotel", "place"], required: true },
    name: String,
    details: Object
  },
  { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);
