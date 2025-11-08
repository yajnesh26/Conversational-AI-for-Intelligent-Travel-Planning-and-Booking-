import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import Loader from "./Loader.jsx";
import { chat, chatItinerary } from "../services/api.js";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I’m your AI travel planner. Ask me to plan your next adventure!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  // For edit modal
  const [editValues, setEditValues] = useState({
    source: "",
    destination: "",
    durationDays: 3,
  });

  const recognitionRef = useRef(null);

  // 🎙️ Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Your browser doesn't support voice input.");
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
    setIsListening(!isListening);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // 🧠 Send message logic
  const send = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const tripMatchFull = text.match(
        /trip\s+from\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)(?:\s+for\s+(\d+)\s*(?:days|day)?)?/i
      );
      const tripMatchSimple = text.match(/(\d+)\s*-?\s*day.*trip.*to\s+([A-Za-z\s]+)/i);
      const isTripRequest = /plan|itinerary|trip/i.test(text);

      let payload = null;

      if (tripMatchFull || tripMatchSimple || isTripRequest) {
        let source = "";
        let destination = "";
        let durationDays = 3;

        if (tripMatchFull) {
          source = tripMatchFull[1].trim();
          destination = tripMatchFull[2].trim();
          durationDays = tripMatchFull[3] ? parseInt(tripMatchFull[3]) : 3;
        } else if (tripMatchSimple) {
          durationDays = parseInt(tripMatchSimple[1]);
          destination = tripMatchSimple[2].trim();
        } else {
          const destinationMatch = text.match(/to\s+([A-Za-z\s]+)/i);
          destination = destinationMatch ? destinationMatch[1].trim() : "Goa";
        }

        // ✅ Subtract 2 days for travel if trip > 3 days
        const travelDays = durationDays > 3 ? 2 : 1;
        const sightseeingDays = Math.max(1, durationDays - travelDays);

        payload = { source, destination, durationDays, sightseeingDays };

        const data = await chatItinerary(payload);

        // Add travel days in UI display
        const enhancedData = {
          ...data,
          source,
          destination,
          durationDays,
          travelDays,
        };

        setTripData(enhancedData);
        setEditValues({ source, destination, durationDays });
        speakText(`Here’s your ${durationDays}-day trip plan from ${source || "your city"} to ${destination}`);
      } else {
        const { reply } = await chat(text);
        setMessages((m) => [...m, { from: "bot", text: reply }]);
        speakText(reply);
      }
    } catch (e) {
      console.error("Chat error:", e);
      setMessages((m) => [
        ...m,
        { from: "bot", text: "⚠️ Something went wrong while planning your trip." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Handle Plan Edit
  const updateTrip = async () => {
    const { source, destination, durationDays } = editValues;
    setShowEdit(false);
    setLoading(true);
    try {
      const payload = { source, destination, durationDays };
      const data = await chatItinerary(payload);
      const enhancedData = {
        ...data,
        source,
        destination,
        durationDays,
      };
      setTripData(enhancedData);
    } catch (err) {
      console.error("Error updating trip:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f1f5f9" }}>
      {/* 💬 Chatbot Section (Left) */}
      <div
        style={{
          width: "30%",
          background: "#ffffff",
          borderRight: "2px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          margin: "20px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ padding: "16px", overflowY: "auto", flexGrow: 1 }}>
          {messages.map((m, i) => (
            <MessageBubble key={i} {...m} />
          ))}
          {loading && <Loader />}
        </div>

        {/* 🎙️ Input area */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "10px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or speak..."
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
            }}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button
            onClick={toggleListening}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: isListening ? "#dc2626" : "#22c55e",
              color: "#fff",
              border: "none",
              fontWeight: 600,
            }}
          >
            {isListening ? "🔇" : "🎙️"}
          </button>
          <button
            onClick={send}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              fontWeight: 600,
            }}
          >
            ➤
          </button>
        </div>
      </div>

      {/* 🌍 Trip Plan Section (Right) */}
      <div
        style={{
          flex: 1,
          padding: "24px",
          background: "linear-gradient(135deg, #dbeafe, #fef3c7)",
          overflowY: "auto",
        }}
      >
        {!tripData ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              fontSize: "1.1rem",
            }}
          >
            💬 Start chatting to generate your personalized trip plan!
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#1e3a8a" }}>
                🗺️ {tripData.source ? `${tripData.source} → ` : ""}{tripData.destination} Trip Plan ({tripData.durationDays} Days)
              </h2>
              <button
                onClick={() => setShowEdit(true)}
                style={{
                  marginTop: "10px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                ✏️ Change Plan
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
              }}
            >
              {tripData.itinerary?.map((day) => (
                <div
                  key={day.day}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3 style={{ color: "#2563eb" }}>📅 Day {day.day}</h3>
                  <ul style={{ marginTop: "10px", marginBottom: "10px" }}>
                    {day.plan?.map((p, i) => (
                      <li key={i}>
                        • {typeof p === "string" ? p : p.name ? `${p.name} — ${p.description || ""}` : JSON.stringify(p)}
                      </li>
                    ))}
                  </ul>

                  {day.hotel && (
                    <div>
                      <p>🏨 <strong>{day.hotel.name}</strong> ({day.hotel.rating}⭐)</p>
                      <p>💰 {day.hotel.price}</p>
                      <button
                        onClick={() => window.open("https://www.booking.com", "_blank")}
                        style={{
                          marginTop: "10px",
                          background: "#2563eb",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ✏️ Edit Plan Modal */}
      {showEdit && (
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
            zIndex: 100,
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
            <h3>✏️ Edit Trip Plan</h3>
            <label>Source:</label>
            <input
              value={editValues.source}
              onChange={(e) => setEditValues({ ...editValues, source: e.target.value })}
              style={{ width: "100%", marginBottom: 10, padding: 6 }}
            />
            <label>Destination:</label>
            <input
              value={editValues.destination}
              onChange={(e) => setEditValues({ ...editValues, destination: e.target.value })}
              style={{ width: "100%", marginBottom: 10, padding: 6 }}
            />
            <label>Days:</label>
            <input
              type="number"
              min="1"
              value={editValues.durationDays}
              onChange={(e) =>
                setEditValues({ ...editValues, durationDays: parseInt(e.target.value) })
              }
              style={{ width: "100%", marginBottom: 10, padding: 6 }}
            />
            <div>
              <button
                onClick={updateTrip}
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  marginRight: 8,
                  cursor: "pointer",
                }}
              >
                Update
              </button>
              <button
                onClick={() => setShowEdit(false)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



