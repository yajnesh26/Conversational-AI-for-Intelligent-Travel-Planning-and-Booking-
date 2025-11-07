import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://api.opentripmap.com/0.1/en";
const OTM_KEY = process.env.OPENTRIPMAP_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

// 🧠 Simple in-memory cache for Pexels images to reduce API calls
const imageCache = new Map();

/**
 * 🔹 Get city coordinates with fallback to OpenStreetMap
 */
export const getCityCoordinates = async (city) => {
  try {
    // 🗺️ Try OpenTripMap Geoname
    const otmRes = await axios.get(`${BASE_URL}/places/geoname`, {
      params: { name: city, apikey: OTM_KEY },
    });

    if (otmRes.data?.lat && otmRes.data?.lon) {
      return { lat: otmRes.data.lat, lon: otmRes.data.lon };
    }

    console.warn(`⚠️ OpenTripMap couldn't find "${city}". Falling back to OSM.`);

    // 🧭 Fallback: OpenStreetMap (Nominatim)
    const osmRes = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: city, format: "json", limit: 1 },
    });

    if (osmRes.data?.length) {
      return { lat: osmRes.data[0].lat, lon: osmRes.data[0].lon };
    }

    throw new Error(`No coordinates found for city: ${city}`);
  } catch (err) {
    console.error("❌ Error fetching city coordinates:", err.message);
    // Safe fallback to Goa (so you never get undefined coords)
    return { lat: 15.2993, lon: 74.124 };
  }
};

/**
 * 🖼️ Fetch image from Pexels with caching & intelligent query
 */
const getImageFromPexels = async (query) => {
  if (!PEXELS_KEY || !query) return null;

  // 🧠 Check cache first
  if (imageCache.has(query.toLowerCase())) {
    return imageCache.get(query.toLowerCase());
  }

  try {
    const { data } = await axios.get("https://api.pexels.com/v1/search", {
      headers: { Authorization: PEXELS_KEY },
      params: { query, per_page: 1, orientation: "landscape" },
    });

    const url = data.photos?.[0]?.src?.medium || null;

    if (url) {
      imageCache.set(query.toLowerCase(), url); // cache it
    }

    return url;
  } catch (err) {
    console.warn("⚠️ Pexels fetch failed for:", query, "|", err.message);
    return null;
  }
};

/**
 * 🏝️ Get detailed tourist attractions with high-quality images
 */
export const getTouristAttractions = async (lat, lon, radius = 10000, limit = 10) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/places/radius`, {
      params: {
        radius,
        lon,
        lat,
        limit,
        apikey: OTM_KEY,
        format: "json",
        kinds: "interesting_places,tourist_facilities,cultural,beaches,natural",
      },
    });

    if (!data?.length) {
      console.warn(`⚠️ No attractions found near lat=${lat}, lon=${lon}`);
      return [];
    }

    const seen = new Set();
    const attractions = await Promise.all(
      data
        .filter((p) => p.name && !seen.has(p.name) && seen.add(p.name))
        .map(async (place) => {
          let photoUrl = null;
          let description = "";

          // 1️⃣ Try OpenTripMap details
          try {
            if (place.xid) {
              const details = await axios.get(`${BASE_URL}/places/xid/${place.xid}`, {
                params: { apikey: OTM_KEY },
              });

              photoUrl = details.data.preview?.source || null;
              description =
                details.data.wikipedia_extracts?.text ||
                details.data.info?.descr ||
                "No description available.";
            }
          } catch {
            photoUrl = null;
          }

          // 2️⃣ If no photo, fetch from Pexels
          if (!photoUrl) {
            const searchQuery = `${place.name} ${place.kinds?.split(",")[0] || "tourist spot"}`;
            const pexelsImage = await getImageFromPexels(searchQuery);
            photoUrl =
              pexelsImage ||
              "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
          }

          // 3️⃣ Metadata
          const costEstimate = Math.floor(200 + Math.random() * 800); // ₹200–₹1000
          const distance = place.dist ? `${(place.dist / 1000).toFixed(1)} km` : "N/A";

          return {
            name: place.name || "Unknown Place",
            description,
            distance,
            kinds: place.kinds?.split(",")[0] || "attraction",
            rating: place.rate || "N/A",
            cost: `₹${costEstimate}`,
            image: photoUrl,
          };
        })
    );

    return attractions;
  } catch (err) {
    console.error("❌ Error fetching attractions:", err.message);
    return [];
  }
};
