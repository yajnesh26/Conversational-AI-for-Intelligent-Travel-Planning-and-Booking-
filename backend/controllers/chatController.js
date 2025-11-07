import { getCityCoordinates } from "../services/locationService.js";
import { getTouristAttractions } from "../services/travelService.js";
import { chatWithAI } from "../services/geminiService.js";

/**
 * ✈️ General Chat — Travel Only
 */
export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    res.json({
      reply:
        "👋 Hi! I’m your AI travel assistant ✈️\nI can help plan trips, find attractions, hotels, or create full itineraries.\n\nTry:\n➡️ Plan a 3-day trip to Goa\n➡️ Plan a trip from Mangalore to Ooty with 10000 budget",
    });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Chat error" });
  }
};

/**
 * 🧠 Intelligent Travel Query Parser (Groq-powered)
 * Extracts structured trip data from any phrasing.
 */
async function parseTravelQuery(message) {
  const prompt = `
You are a professional travel assistant AI.

Your job: Extract structured trip details from the following message.

Message: "${message}"

Return only valid JSON with these fields:
{
  "source": "",
  "destination": "",
  "durationDays": "",
  "budget": "",
  "interests": []
}

Rules:
- If the user says "trip from X to Y", fill both source and destination.
- If only one city is mentioned, assume it's the destination.
- If the user says "3-day", extract durationDays = 3.
- Convert "10k" or "15k" to numbers (e.g. 10000, 15000).
- If budget not mentioned, leave it empty.
- If interests like "beach", "temple", "mountain" are mentioned, include them in "interests".
Return JSON only — no text or comments.
`;

  const aiResponse = await chatWithAI(prompt);
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");
  return JSON.parse(jsonMatch[0]);
}

/**
 * 🧭 Smart Trip Planner — AI + Real Attractions + Hotels
 */
export const chatItinerary = async (req, res) => {
  try {
    let {
      source = "your location",
      destination,
      durationDays = 3,
      budget = 0,
      interests = [],
      message, // 🧠 optional raw message from user
    } = req.body;

    // 🧠 If no destination, try to extract details using Groq AI
    if (!destination && message) {
      console.log("🧠 Parsing travel query using Groq...");
      const parsed = await parseTravelQuery(message);
      source = parsed.source || source;
      destination = parsed.destination;
      durationDays = parsed.durationDays || durationDays;
      budget = parsed.budget || budget;
      interests = parsed.interests || [];
    }

    if (!destination) {
      return res.status(400).json({ error: "Destination is required." });
    }

    const isSourceProvided =
      source &&
      source !== "your location" &&
      source.trim().toLowerCase() !== destination.trim().toLowerCase();

    console.log(`📍 Generating itinerary for ${destination} (${source || "local"})`);

    // 🌍 Step 1: Get attractions
    const geo = await getCityCoordinates(destination);
    const attractions = await getTouristAttractions(geo.lat, geo.lon, 10000, 10);

    const attractionList = attractions.length
      ? attractions
          .map(
            (a, i) =>
              `${i + 1}. ${a.name} (${a.kinds}, ${a.distance}, ${a.cost}, rating: ${a.rating})`
          )
          .join("\n")
      : "No attractions found.";

    // 🧠 Step 2: AI prompt for itinerary + hotels
    const prompt = `
You are an expert AI travel planner.

Plan a ${durationDays}-day trip ${
      isSourceProvided ? `from ${source} to ${destination}` : `within ${destination}`
    }.

If no source city is provided, assume it's a *local sightseeing trip inside ${destination}* — do NOT write "${destination} → ${destination}" or invent another source.

${budget > 0 ? `Stay within ₹${budget} total budget.` : ""}
User interests: ${interests.length ? interests.join(", ") : "general travel"}.

Here are verified attractions near ${destination}:
${attractionList}

Include:
- A short summary (e.g., "3-day beach and culture trip in Goa")
- For each day: activities, nearby attractions, and a hotel
- If places are close, use same hotel
- Each hotel must include: name, image (royalty-free link), price, rating, and location
- Suggest 2–3 other recommended hotels (with images, price, rating)
- Use proper JSON, no text or markdown

Return valid JSON only:
{
  "summary": "",
  "destination": "${destination}",
  "budget": ${budget},
  "durationDays": ${durationDays},
  "estimated_transport": "₹...",
  "itinerary": [
    {
      "day": 1,
      "plan": ["Activity 1", "Activity 2"],
      "hotel": {
        "name": "",
        "price": "₹...",
        "rating": 4.5,
        "image": "https://...",
        "location": ""
      }
    }
  ],
  "alternative_hotels": [
    {
      "name": "",
      "price": "₹...",
      "rating": 4.3,
      "image": "https://...",
      "location": ""
    }
  ],
  "total_estimated_cost": "₹..."
}
`;

    const raw = await chatWithAI(prompt);

    // 🧩 Step 3: Parse clean JSON safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");

    let jsonData;
    try {
      jsonData = JSON.parse(jsonMatch[0]);
    } catch {
      const cleaned = jsonMatch[0]
        .replace(/(\w+)\s*:/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/“|”/g, '"')
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/\s+/g, " ");
      jsonData = JSON.parse(cleaned);
    }

    // 🧭 Step 4: Attach real attractions
    jsonData.real_attractions = attractions;
    if (!isSourceProvided) delete jsonData.source;

    res.json(jsonData);
  } catch (e) {
    console.error("Itinerary Error:", e.message);
    res.status(500).json({ error: e.message || "Could not generate itinerary" });
  }
};
