import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const chatWithAI = async (prompt) => {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",  // ✅ Updated latest model
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error(
      "Groq Request Error:",
      err.response?.data || err.message
    );
    return "⚠️ AI is unavailable right now.";
  }
};
