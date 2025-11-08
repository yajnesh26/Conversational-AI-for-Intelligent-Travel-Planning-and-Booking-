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
        "👋 Hi! I’m your AI travel assistant ✈️\nI can help plan trips, find attractions, hotels, or create full itineraries.",
    });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Chat error" });
  }
};

/**
 * 🧠 Intelligent Travel Query Parser (AI-powered)
 * Extracts structured trip data from any phrasing, including dates.
 */
async function parseTravelQuery(message) {
  const prompt = `
You are a professional travel assistant AI.

Extract structured trip details from this user message:
"${message}"

Return valid JSON with the following fields:
{
  "source": "",
  "destination": "",
  "durationDays": "",
  "budget": "",
  "interests": [],
  "startDate": "",
  "endDate": ""
}

Rules:
- Detect start and end dates if mentioned (e.g., "from March 10 to March 15").
- If only one date is given and duration is mentioned, calculate endDate accordingly.
- If dates are given, calculate "durationDays" automatically.
- If "3-day" or "5 days" is said, extract durationDays.
- Include interests like "beach", "adventure", "culture", etc.
- Convert shorthand budgets like "10k" to full number 10000.
- Return ONLY JSON, no text or markdown.
`;

  const aiResponse = await chatWithAI(prompt);
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");
  return JSON.parse(jsonMatch[0]);
}

/**
 * 🧭 Smart Trip Planner — AI + Real Attractions + Hotels + Dates + Travel Days
 */
export const chatItinerary = async (req, res) => {
  try {
    let {
      source = "your location",
      destination,
      durationDays = 3,
      budget = 0,
      interests = [],
      message,
      startDate,
      endDate,
    } = req.body;

    // 🧠 Use AI if no destination or date provided
    if ((!destination || !startDate) && message) {
      console.log("🧠 Parsing travel query using AI...");
      const parsed = await parseTravelQuery(message);
      source = parsed.source || source;
      destination = parsed.destination || destination;
      durationDays = parsed.durationDays || durationDays;
      budget = parsed.budget || budget;
      interests = parsed.interests || interests;
      startDate = parsed.startDate || startDate;
      endDate = parsed.endDate || endDate;
    }

    if (!destination) {
      return res.status(400).json({ error: "Destination is required." });
    }

    // 🗓️ Calculate duration if start and end dates exist
    if (startDate && endDate && !durationDays) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    }

    // 🎯 Add realistic travel days
    const travelDays = durationDays > 3 ? 2 : 1;
    const sightseeingDays = Math.max(1, durationDays - travelDays);

    const isSourceProvided =
      source &&
      source !== "your location" &&
      source.trim().toLowerCase() !== destination.trim().toLowerCase();

    console.log(
      `🗺️ Planning ${durationDays}-day trip ${isSourceProvided ? `from ${source} to ${destination}` : `in ${destination}`}`
    );

    // 🌍 Step 1: Get attractions
    const geo = await getCityCoordinates(destination);
    const attractions = await getTouristAttractions(geo.lat, geo.lon, 15000, 12);

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
      isSourceProvided ? `from ${source} to ${destination}` : `in ${destination}`
    }.

Trip details:
- Start date: ${startDate || "not specified"}
- End date: ${endDate || "not specified"}
- Total days: ${durationDays}
- Travel days: ${travelDays}
- Sightseeing days: ${sightseeingDays}
${budget > 0 ? `- Stay within ₹${budget} total budget.` : ""}
- User interests: ${interests.length ? interests.join(", ") : "general travel"}

Consider:
- First day: traveling to destination
- Last day: return journey
- Remaining days: sightseeing, exploring attractions, and relaxing.
- Suggest 2–3 alternate hotels.
- Include image URLs, ratings, and estimated daily costs.

Here are verified attractions near ${destination}:
${attractionList}

Return valid JSON only:
{
  "summary": "",
  "source": "${source}",
  "destination": "${destination}",
  "startDate": "${startDate || ""}",
  "endDate": "${endDate || ""}",
  "durationDays": ${durationDays},
  "budget": ${budget},
  "estimated_transport": "₹...",
  "itinerary": [
    {
      "day": 1,
      "date": "",
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

    // 🧩 Step 3: Parse JSON safely
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
    jsonData.travelDays = travelDays;
    jsonData.sightseeingDays = sightseeingDays;

    res.json(jsonData);
  } catch (e) {
    console.error("Itinerary Error:", e.message);
    res.status(500).json({ error: e.message || "Could not generate itinerary" });
  }
};


