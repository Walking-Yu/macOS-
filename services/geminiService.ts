import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

export const analyzeTextWithGemini = async (text: string): Promise<AnalysisResult> => {
  if (!text || text.trim().length < 10) {
    throw new Error("Please type at least 10 characters for analysis.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze the following text for tone, summary, and writing improvement suggestions. 
  Also provide an estimated WPM (Words Per Minute) rating based on complexity (simple=high wpm, complex=low wpm) relative to an average typist, just as a fun metric.
  
  Text to analyze: "${text}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tone: { type: Type.STRING, description: "The overall tone of the text (e.g., Professional, Casual, Urgent)." },
          summary: { type: Type.STRING, description: "A very brief summary of the content (max 1 sentence)." },
          suggestions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 3 short bullet points to improve the writing."
          },
          wpmEstimate: { type: Type.NUMBER, description: "A complexity score from 0-100." }
        },
        required: ["tone", "summary", "suggestions", "wpmEstimate"]
      }
    }
  });

  const textResponse = response.text;
  if (!textResponse) {
    throw new Error("No response from Gemini.");
  }

  return JSON.parse(textResponse) as AnalysisResult;
};
