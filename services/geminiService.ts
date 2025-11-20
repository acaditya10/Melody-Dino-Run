import { GoogleGenAI, Type } from "@google/genai";
import { ParsedNotesResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNotesFromInput = async (userInput: string): Promise<ParsedNotesResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a musical sequence for a rhythm game based on this input: "${userInput}".
      
      Return a JSON object with:
      1. "bpm": An integer beats per minute (ideal range 90-130). If the song is fast, use half-time bpm.
      2. "notes": An array of objects, each having:
         - "pitch": String (e.g., "C4", "F#5").
         - "duration": Number representing beats (e.g., 1.0 for quarter, 0.5 for eighth, 2.0 for half).
      3. "description": Brief text describing the result.

      Rules:
      - If input is random/nonsense, generate a rhythmic scale or simple melody at 110 BPM.
      - If input is a song name, approximate its main melody and tempo.
      - Ensure durations are playable (avoid endless strings of 0.25 durations).
      - Use standard scientific pitch notation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bpm: { type: Type.INTEGER, description: "Tempo in Beats Per Minute" },
            notes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pitch: { type: Type.STRING },
                  duration: { type: Type.NUMBER }
                },
                required: ["pitch", "duration"]
              }
            },
            description: { type: Type.STRING }
          },
          required: ["bpm", "notes"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ParsedNotesResponse;
    }
    
    return { 
      bpm: 110,
      notes: [
        { pitch: "C4", duration: 1 }, { pitch: "D4", duration: 1 }, 
        { pitch: "E4", duration: 1 }, { pitch: "F4", duration: 1 }
      ], 
      description: "Fallback Melody" 
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      bpm: 110,
      notes: [
        { pitch: "C4", duration: 1 }, { pitch: "D4", duration: 1 }, 
        { pitch: "E4", duration: 1 }, { pitch: "F4", duration: 1 }
      ], 
      description: "Error Fallback" 
    };
  }
};
