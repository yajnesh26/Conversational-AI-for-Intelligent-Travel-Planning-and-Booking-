import React from "react";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ from = "user", text = "" }) {
  const isUser = from === "user";

  // 🧠 Convert plain image URLs → Markdown image syntax
  const processedText = text.replace(
    /(https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp|svg))/gi,
    "![]($1)"
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        margin: "10px 0",
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "12px 16px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isUser ? "#2563eb" : "#f8fafc",
          color: isUser ? "#fff" : "#111",
          boxShadow: isUser
            ? "0 2px 8px rgba(37,99,235,0.3)"
            : "0 2px 8px rgba(0,0,0,0.1)",
          wordWrap: "break-word",
          overflow: "hidden",
        }}
      >
        <ReactMarkdown
          components={{
            // 🖼️ Render image directly (no <div> wrapping)
            img: ({ node, ...props }) => {
              // Avoid rendering broken or empty src
              if (!props.src) return null;
              return (
                <img
                  {...props}
                  alt={props.alt || "Travel attraction"}
                  loading="lazy"
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    borderRadius: 10,
                    margin: "8px 0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
                  }}
                />
              );
            },

            // 🔗 Link styling
            a: ({ node, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: isUser ? "#dbeafe" : "#2563eb",
                  textDecoration: "underline",
                  wordBreak: "break-all",
                  fontWeight: 500,
                }}
              />
            ),

            // 🧾 Paragraph style
            p: ({ node, ...props }) => (
              <p
                {...props}
                style={{
                  margin: "6px 0",
                  lineHeight: "1.5",
                  fontSize: "0.95rem",
                  whiteSpace: "pre-wrap",
                }}
              />
            ),

            // 💬 Bold/strong text
            strong: ({ node, ...props }) => (
              <strong
                {...props}
                style={{
                  fontWeight: 700,
                  color: isUser ? "#bfdbfe" : "#1e3a8a",
                }}
              />
            ),
          }}
        >
          {processedText}
        </ReactMarkdown>
      </div>
    </div>
  );
}
