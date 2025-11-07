import React, { useState } from "react";
import MessageBubble from "./MessageBubble.jsx";
import Loader from "./Loader.jsx";
import { chat, chatItinerary } from "../services/api.js";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hi! I’m your AI travel planner.\nYou can say:\n- 'Plan a 3-day trip to Goa'\n- 'Plan a trip from Mangalore to Goa with 10000 budget'",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Booking state
  const [showBooking, setShowBooking] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState(1);

  // 🧠 Handle Send Message
  const send = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      // Detect trip-related message
      const tripMatchFull = text.match(
        /trip\s+from\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)(?:\s+with\s+(\d+)\s*(?:rs|rupees|budget|inr)?)?$/i
      );
      const tripMatchSimple = text.match(/(\d+)\s*-?\s*day.*trip.*to\s+([A-Za-z\s]+)/i);
      const isTripRequest = /plan|itinerary|trip/i.test(text);

      let payload = null;

      if (tripMatchFull || tripMatchSimple || isTripRequest) {
        if (tripMatchFull) {
          const source = tripMatchFull[1].trim();
          const destination = tripMatchFull[2].trim();
          const budget = tripMatchFull[3] ? parseInt(tripMatchFull[3]) : 0;
          const cleanDestination = destination
            .replace(/\b(with|under|budget|rs|inr)\b.*$/i, "")
            .trim();
          payload = { source, destination: cleanDestination, budget };
        } else if (tripMatchSimple) {
          const durationDays = parseInt(tripMatchSimple[1]);
          const destination = tripMatchSimple[2].trim();
          const cleanDestination = destination
            .replace(/\b(with|under|budget|rs|inr)\b.*$/i, "")
            .trim();
          payload = { destination: cleanDestination, durationDays, interests: [] };
        } else {
          const destination = text.match(/to\s+([A-Za-z\s]+)/i)?.[1] || "Goa";
          const cleanDestination = destination
            .replace(/\b(with|under|budget|rs|inr)\b.*$/i, "")
            .trim();
          payload = { destination: cleanDestination, durationDays: 3 };
        }

        const data = await chatItinerary(payload,text);
        const formatted = formatItinerary(data);
        setMessages((m) => [...m, { from: "bot", text: formatted, hotels: data }]);
      } else {
        const { reply } = await chat(text);
        setMessages((m) => [...m, { from: "bot", text: reply }]);
      }
    } catch (e) {
      console.error("Chat error:", e);
      setMessages((m) => [
        ...m,
        { from: "bot", text: "⚠️ Oops! Something went wrong while planning your trip." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✨ Format Trip Itinerary
  const formatItinerary = (data) => {
    if (!data) return "⚠️ No itinerary available.";

    const {
      source,
      destination,
      summary,
      durationDays,
      budget,
      itinerary,
      alternative_hotels,
      total_estimated_cost,
    } = data;

    let output = `🗺️ **${source ? `${source} → ` : ""}${destination} Trip Plan**\n\n`;
    if (summary) output += `✨ ${summary}\n\n`;
    if (durationDays) output += `📅 Duration: ${durationDays} days\n`;
    if (budget && budget > 0) output += `💰 Budget: ₹${budget}\n\n`;

    if (itinerary?.length) {
      itinerary.forEach((day) => {
        output += `📅 **Day ${day.day}:**\n`;
        (day.plan || []).forEach((a) => (output += `   • ${a}\n`));
        if (day.hotel) {
          output += `🏨 **Hotel:** ${day.hotel.name} (${day.hotel.rating}⭐)\n💰 ${day.hotel.price} — ${day.hotel.location}\n`;
          if (day.hotel.image)
            output += `![${day.hotel.name}](${day.hotel.image})\n\n`;
          output += `[Book Now 🏷️](#book-${day.hotel.name.replace(/\s+/g, "-")})\n\n`;
        }
        output += "\n";
      });
    }

    if (alternative_hotels?.length) {
      output += "🏕️ **Other Recommended Hotels:**\n";
      alternative_hotels.forEach((h) => {
        output += `🏨 ${h.name} — ${h.rating}⭐ — ${h.price}\n`;
        if (h.image) output += `![${h.name}](${h.image})\n`;
        output += `[Book Now 🏷️](#book-${h.name.replace(/\s+/g, "-")})\n\n`;
      });
    }

    if (total_estimated_cost)
      output += `💵 **Total Estimated Cost:** ${total_estimated_cost}\n`;

    return output;
  };

  // 🏨 Booking Popup Logic
  const handleBook = (hotel) => {
    setSelectedHotel(hotel);
    setRooms(1);
    setShowBooking(true);
  };

  const handlePayment = () => {
    alert(
      `✅ Booking confirmed for ${rooms} room(s) at ${selectedHotel.name}.\n💰 Total: ${
        parseInt(selectedHotel.price.replace(/\D/g, "")) * rooms
      }`
    );
    setShowBooking(false);
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "24px auto",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        position: "relative",
      }}
    >
      <div style={{ minHeight: 420, whiteSpace: "pre-wrap" }}>
        {messages.map((m, i) => (
          <div key={i}>
            <MessageBubble {...m} />
            {/* Render hotel cards if data exists */}
            {m.hotels?.itinerary?.map((day, idx) =>
              day.hotel ? (
                <div
                  key={idx}
                  style={{
                    background: "#f9fafb",
                    borderRadius: 10,
                    padding: 10,
                    margin: "8px 0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <h4>🏨 {day.hotel.name}</h4>
                  <p>
                    💰 {day.hotel.price} | ⭐ {day.hotel.rating} | 📍{" "}
                    {day.hotel.location}
                  </p>
                  {day.hotel.image && (
                    <img
                      src={day.hotel.image}
                      alt={day.hotel.name}
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    />
                  )}
                  <button
                    onClick={() => handleBook(day.hotel)}
                    style={{
                      padding: "6px 14px",
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Book Now
                  </button>
                </div>
              ) : null
            )}
          </div>
        ))}
        {loading && <Loader />}
      </div>

      {/* Input box */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Try: Plan a trip from Mangalore to Goa with 10000 budget..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
          }}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: 0,
            background: "#2563eb",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Send
        </button>
      </div>

      {/* 🏨 Booking Modal */}
      {showBooking && selectedHotel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              width: "90%",
              maxWidth: 400,
              textAlign: "center",
              boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            }}
          >
            <h3>Book {selectedHotel.name}</h3>
            <img
              src={selectedHotel.image}
              alt={selectedHotel.name}
              style={{
                width: "100%",
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <p>
              {selectedHotel.price} | ⭐ {selectedHotel.rating}
            </p>
            <div style={{ marginBottom: 10 }}>
              <label>Number of rooms: </label>
              <input
                type="number"
                min="1"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                style={{
                  width: "60px",
                  marginLeft: 6,
                  padding: 4,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <button
              onClick={handlePayment}
              style={{
                padding: "10px 16px",
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                marginRight: 8,
              }}
            >
              Proceed to Pay
            </button>
            <button
              onClick={() => setShowBooking(false)}
              style={{
                padding: "10px 16px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
