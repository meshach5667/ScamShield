import { GoogleGenAI, Type } from "@google/genai";
import { ScamAnalysisResult } from "../types";

// Initialize the Gemini API
// Note: process.env.GEMINI_API_KEY is injected by AI Studio
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY || "" 
});

const SYSTEM_PROMPT = `You are ScamShield AI, a scam detection assistant.

Your job is to analyze suspicious messages, screenshots, and voice note transcripts and determine whether they are scams, suspicious, or safe.

Focus especially on scams common in Nigeria and Africa, such as:
- fake bank alerts
- account suspension scams
- fake job offers
- giveaway scams
- investment scams
- impersonation scams
- urgent money requests
- POS and transfer scams

Look for:
- urgency
- fear tactics
- suspicious requests
- impersonation
- requests for money or sensitive data
- emotional manipulation
- fake authority
- pressure to act immediately

Return your response ONLY as valid JSON.
If uncertain, use SUSPICIOUS.
Keep explanation concise but useful.`;

const TRANSCRIPTION_PROMPT = `You are a transcription assistant.
Transcribe this audio clearly and accurately.
Return only the spoken words as plain text.
Do not summarize.
Do not add labels.
Do not explain anything.`;

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

export async function transcribeAudio(
  audioBuffer: string,
  mimeType: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: TRANSCRIPTION_PROMPT },
          {
            inlineData: {
              data: audioBuffer,
              mimeType: mimeType,
            },
          },
        ],
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    throw error;
  }
}

export async function analyzeScam(
  text?: string,
  imageBuffer?: string,
  imageMimeType?: string,
  sourceType: "text" | "screenshot" | "voicenote" = "text"
): Promise<ScamAnalysisResult> {
  const parts: any[] = [];

  const sourceLabel = sourceType === "voicenote" ? "Voice note transcript" : sourceType === "screenshot" ? "Screenshot text" : "Text message";
  
  if (text) {
    parts.push({ text: `${sourceLabel} to analyze: ${text}` });
  }

  if (imageBuffer && imageMimeType) {
    parts.push({
      inlineData: {
        data: imageBuffer,
        mimeType: imageMimeType,
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
