import { GoogleGenAI, Type } from "@google/genai";
import { ScamAnalysisResult } from "../types";

// Initialize the Gemini API
// Note: process.env.GEMINI_API_KEY is injected by AI Studio
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY || "" 
});

const SYSTEM_PROMPT = `You are ScamShield AI, a multimodal scam detection assistant.

Your job is to analyze suspicious screenshots and text messages and determine whether they are scams, suspicious, or safe.

Focus especially on scams common in Nigeria and Africa, such as:
- fake bank alerts
- account suspension scams
- fake job offers
- giveaway scams
- investment scams
- impersonation scams
- urgent money requests
- POS/transfer scams

Look for:
- urgency
- fear tactics
- suspicious links
- impersonation
- requests for money or sensitive data
- emotional manipulation

Return your response ONLY as valid JSON.
If uncertain, use SUSPICIOUS.
Keep explanation concise but clear.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      description: "The verdict: SCAM, SUSPICIOUS, or NOT SCAM",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence percentage (0-100)",
    },
    scamType: {
      type: Type.STRING,
      description: "The type of scam identified",
    },
    explanation: {
      type: Type.STRING,
      description: "A short explanation of why this verdict was reached",
    },
    redFlags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of red flags identified",
    },
    safetyAdvice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of safety advice for the user",
    },
  },
  required: ["verdict", "confidence", "scamType", "explanation", "redFlags", "safetyAdvice"],
};

export async function analyzeScam(
  text?: string,
  imageBuffer?: string,
  mimeType?: string
): Promise<ScamAnalysisResult> {
  const parts: any[] = [];

  if (text) {
    parts.push({ text: `Text message to analyze: ${text}` });
  }

  if (imageBuffer && mimeType) {
    parts.push({
      inlineData: {
        data: imageBuffer,
        mimeType: mimeType,
      },
    });
  }

  if (parts.length === 0) {
    throw new Error("No input provided for analysis.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(resultText) as ScamAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
