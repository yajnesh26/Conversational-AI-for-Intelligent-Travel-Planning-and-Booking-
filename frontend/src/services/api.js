// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
// });

// export const chat = (message, context = {}) =>
//   api.post("/api/chat", { message, context }).then((r) => r.data);

// export const chatItinerary = (payload) =>
//   api.post("/api/chat/itinerary", payload).then((r) => r.data);

// export const login = (email, password) =>
//   api.post("/api/auth/login", { email, password }).then((r) => r.data);

// export const register = (payload) =>
//   api.post("/api/auth/register", payload).then((r) => r.data);

// export default api;


import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
});

// 💬 Basic chat
export const chat = (message, context = {}) =>
  api.post("/api/chat", { message, context }).then((r) => r.data);

// 🧭 Itinerary planner (now sends raw user query too)
export const chatItinerary = (payload, message = "") =>
  api.post("/api/chat/itinerary", { ...payload, message }).then((r) => r.data);

// 👤 Auth
export const login = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const register = (payload) =>
  api.post("/api/auth/register", payload).then((r) => r.data);

export default api;
