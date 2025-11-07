import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HOST = process.env.RAPIDAPI_HOST;
const KEY = process.env.RAPIDAPI_KEY;

export const getCityCoordinate = async (city) => {
  const url = `https://${HOST}/en/places/geoname?name=${city}`;
  
  const response = await axios.get(url, {
    headers: {
      "x-rapidapi-host": HOST,
      "x-rapidapi-key": KEY,
    }
  });

  return response.data;  // includes lat + lon
};
