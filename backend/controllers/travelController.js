import { getCityCoordinates, getTouristAttractions } from "../services/travelService.js";

export const getAttractionsByCity = async (req, res, next) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "City name required" });

    // Get coordinates of the city
    const geo = await getCityCoordinates(city);

    // Get tourist attractions near the coordinates
    const attractions = await getTouristAttractions(geo.lat, geo.lon);

    res.json({
      city: geo.name,
      coordinates: { lat: geo.lat, lon: geo.lon },
      attractions,
    });
  } catch (err) {
    console.error("Attractions Error:", err.message);
    res.status(500).json({ error: "Could not fetch attractions" });
  }
};
