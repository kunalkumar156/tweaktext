import dotenv from "dotenv";
import path from "path";

// ✅ Load environment variables from root-level .env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ Updated to Gemini 2.0 Flash
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Sends raw text to Gemini 2.0 Flash to clean and rewrite it.
 * Returns the refined sentence or null if unsuccessful.
 */
export async function cleanWithGemini(rawText: string): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found in environment variables.");
    return null;
  }

  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Fix the grammar and clarity of this sentence. Just return the corrected version:\n"${rawText}"`,
            },
          ],
        },
      ],
    };

    console.log("📤 Sending request to Gemini 2.0 Flash...");

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log("📥 Gemini response:", JSON.stringify(data, null, 2));

    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!result) {
      console.error("❌ Gemini did not return a valid result.");
      return null;
    }

    return result;
  } catch (err) {
    console.error("❌ Gemini API error:", err);
    return null;
  }
}
