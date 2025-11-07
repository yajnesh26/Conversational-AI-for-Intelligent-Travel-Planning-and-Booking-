import mongoose from "mongoose";

const dayPlanSchema = new mongoose.Schema({
  day: Number,
  title: String,
  activities: [String]
});

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    destination: String,
    startDate: Date,
    endDate: Date,
    durationDays: Number,
    interests: [String],
    budget: Number,
    itinerary: [dayPlanSchema],
    hotels: [{ name: String, price: Number, address: String, rating: Number }]
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);
