import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://api.opentripmap.com/0.1/en";

export const getCityCoordinates = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}/places/geoname`, {
      params: { name: city, apikey: process.env.OPENTRIPMAP_KEY },
    });

    // if city found → return it
    if (response.data && response.data.lat) return response.data;

    // fallback to OpenStreetMap
    console.warn(`⚠️ OpenTripMap couldn't find "${city}". Falling back to OpenStreetMap.`);
    const nominatim = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { city, format: "json", limit: 1 },
      headers: { "User-Agent": "TravelAI/1.0" },
    });

    if (nominatim.data && nominatim.data.length > 0) {
      const loc = nominatim.data[0];
      return {
        name: loc.display_name.split(",")[0],
        lat: parseFloat(loc.lat),
        lon: parseFloat(loc.lon),
        country: loc.display_name.split(",").pop().trim(),
      };
    }

    throw new Error(`City not found: ${city}`);
  } catch (err) {
    console.error("getCityCoordinates Error:", err.message);
    throw new Error(`City not found: ${city}`);
  }
};
