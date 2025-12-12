import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `
You are a helpful medical translator. Analyze this medical input (image or text). 
If it's a Lab Result, extract the values and explain them simply. 
If it's a Prescription, explain what the drug is for and common side effects. 
If it's Jargon, define it. 
Output clean Markdown. Use bolding for key terms. Keep it concise and empathetic.
`;

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing. Please add 'API_KEY' to your environment variables in Vercel settings.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeMedicalImage = async (base64Image: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    
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
  } catch (error: any) {
    console.error("Gemini Analysis Failed:", error);
    if (error.message.includes("API_KEY is missing")) {
       throw error;
    }
    throw new Error("Failed to analyze image. Please check your connection and try again.");
  }
};

export const analyzeMedicalText = async (text: string): Promise<string> => {
  try {
    const ai = getGeminiClient();

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
  } catch (error: any) {
    console.error("Gemini Analysis Failed:", error);
    if (error.message.includes("API_KEY is missing")) {
       throw error;
    }
    throw new Error("Failed to analyze text. Please check your connection and try again.");
  }
};