import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `
You are a helpful medical translator. Analyze this medical input (image or text). 
If it's a Lab Result, extract the values and explain them simply. 
If it's a Prescription, explain what the drug is for and common side effects. 
If it's Jargon, define it. 
Output clean Markdown. Use bolding for key terms. Keep it concise and empathetic.
`;

export const analyzeMedicalImage = async (base64Image: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // The base64 string from FileReader includes the prefix "data:image/jpeg;base64,", 
    // we need to strip that for the API if it exists, or pass it cleanly.
    // The @google/genai library often handles this, but let's be safe and extract the data part.
    const base64Data = base64Image.split(',')[1] || base64Image;
    const mimeType = base64Image.substring(base64Image.indexOf(':') + 1, base64Image.indexOf(';')) || 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { text: SYSTEM_PROMPT },
            { inlineData: { mimeType: mimeType, data: base64Data } }
        ]
      },
      config: { temperature: 0.4 }
    });

    return response.text || "I couldn't analyze that image. Please try again with a clearer photo.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Failed to analyze image. Please check your connection and try again.");
  }
};

export const analyzeMedicalText = async (text: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { text: SYSTEM_PROMPT },
            { text: `Here is the medical text content:\n${text}` }
        ]
      },
      config: { temperature: 0.4 }
    });

    return response.text || "I couldn't analyze that text. Please try again.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Failed to analyze text. Please check your connection and try again.");
  }
};