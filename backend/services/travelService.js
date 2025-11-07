import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://api.opentripmap.com/0.1/en";
const OTM_KEY = process.env.OPENTRIPMAP_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

// 🧠 In-memory cache for Pexels images to reduce API calls
const imageCache = new Map();

/**
 * 🌍 Get city coordinates using OpenTripMap → OpenStreetMap fallback
 */
export const getCityCoordinates = async (city) => {
  try {
    if (!city || city.trim().length < 2) {
      throw new Error("Invalid city name provided.");
    }

    console.log(`📍 Fetching coordinates for: ${city}`);

    // 1️⃣ Try OpenTripMap Geoname
    try {
      const otmRes = await axios.get(`${BASE_URL}/places/geoname`, {
        params: { name: city, apikey: OTM_KEY },
      });

      if (otmRes.data?.lat && otmRes.data?.lon) {
        console.log(`✅ Found via OpenTripMap: ${city}`);
        return { lat: otmRes.data.lat, lon: otmRes.data.lon };
      }
    } catch (err) {
      console.warn(`⚠️ OpenTripMap lookup failed for "${city}": ${err.message}`);
    }

    // 2️⃣ Fallback: OpenStreetMap (Nominatim)
    try {
      const osmRes = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: city, format: "json", limit: 1 },
      });

      if (osmRes.data?.length) {
        console.log(`✅ Found via OpenStreetMap: ${city}`);
        return { lat: osmRes.data[0].lat, lon: osmRes.data[0].lon };
      }
    } catch (err) {
      console.warn(`⚠️ OpenStreetMap lookup failed for "${city}": ${err.message}`);
    }

    // ❌ No valid city found
    throw new Error(`⚠️ Could not find coordinates for "${city}".`);
  } catch (err) {
    console.error("❌ Error fetching city coordinates:", err.message);
    throw new Error(`⚠️ Could not find coordinates for "${city}".`);
  }
};

/**
 * 🖼️ Fetch image from Pexels with caching
 */
const getImageFromPexels = async (query) => {
  if (!PEXELS_KEY || !query) return null;

  if (imageCache.has(query.toLowerCase())) {
    return imageCache.get(query.toLowerCase());
  }

  try {
    const { data } = await axios.get("https://api.pexels.com/v1/search", {
      headers: { Authorization: PEXELS_KEY },
      params: { query, per_page: 1, orientation: "landscape" },
    });

    const url =
      data.photos?.[0]?.src?.medium ||
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";

    imageCache.set(query.toLowerCase(), url);
    return url;
  } catch (err) {
    console.warn(`⚠️ Pexels fetch failed for "${query}": ${err.message}`);
    return "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
  }
};

/**
 * 🏝️ Get detailed tourist attractions with images and descriptions
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
        kinds: "interesting_places,tourist_facilities,cultural,beaches,natural,architecture",
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

          // 2️⃣ Fallback: Pexels image
          if (!photoUrl) {
            const query = `${place.name} ${place.kinds?.split(",")[0] || "tourist spot"}`;
            photoUrl = await getImageFromPexels(query);
          }

          // 3️⃣ Metadata
          const costEstimate = Math.floor(200 + Math.random() * 800);
          const distance = place.dist ? `${(place.dist / 1000).toFixed(1)} km` : "N/A";

          return {
            name: place.name,
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
