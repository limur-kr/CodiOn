import { GoogleGenAI, Type } from "@google/genai";
import { ClothingAnalysisResult, ClothingItem, OutfitRecommendation, WeatherData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Analyzes a clothing image to extract metadata.
 */
export const analyzeClothingImage = async (base64Image: string): Promise<ClothingAnalysisResult> => {
  // Clean base64 string if it contains the data URI prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this clothing item. Identify the category (Top, Bottom, Outerwear, Shoes, Dress, Accessory), dominant color, suitable seasons (Summer, Winter, Spring, Autumn). Estimate the material composition (e.g., '100% Cotton') and provide short standard care instructions (e.g., 'Machine wash cold'). Write a 1-sentence description. **IMPORTANT: Provide 'material', 'careInstructions', and 'description' in KOREAN.**"
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            color: { type: Type.STRING },
            season: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            material: { type: Type.STRING },
            careInstructions: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["category", "color", "season", "material", "careInstructions", "description"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ClothingAnalysisResult;
    }
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    throw error;
  }
};

/**
 * Generates an outfit recommendation based on closet inventory and weather.
 */
export const generateOutfitSuggestion = async (
  weather: WeatherData,
  closet: ClothingItem[]
): Promise<OutfitRecommendation> => {
  
  // Prepare closet manifest for the prompt
  const closetManifest = closet.map(item => 
    `- ID: ${item.id}, Type: ${item.category}, Color: ${item.color}, Season: ${item.season.join('/')}, Material: ${item.material || 'Unknown'}`
  ).join('\n');

  const weatherContext = `Temperature: ${weather.temperature}°C, Condition: ${weather.condition}, Humidity: ${weather.humidity}%, UV: ${weather.uvIndex}. Description: ${weather.description}`;

  const prompt = `
    Context:
    You are a professional fashion stylist AI.
    
    Task:
    Create ONE perfect outfit recommendation from the user's closet for today's weather.
    You MUST separate the outfit into Top, Bottom, and Outerwear.
    
    Weather:
    ${weatherContext}
    
    Closet Inventory:
    ${closetManifest}
    
    Rules:
    1. Select exactly one item for 'top' (Type: Top or Dress).
    2. Select exactly one item for 'bottom' (Type: Bottom). If 'top' is a Dress, 'bottom' can be null or Shoes.
    3. Select 'outerwear' ONLY if the temperature is below 20°C or if it is Windy/Rainy. Otherwise, return null for outerwear.
    4. Ensure colors match and styles coordinate.
    5. Return the IDs of the selected items.
    6. **IMPORTANT: Provide 'reasoning' and 'styleName' in KOREAN.**
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topId: { type: Type.STRING },
            bottomId: { type: Type.STRING },
            outerwearId: { type: Type.STRING, nullable: true },
            reasoning: { type: Type.STRING },
            styleName: { type: Type.STRING },
            matchScore: { type: Type.NUMBER }
          },
          required: ["topId", "bottomId", "reasoning", "styleName", "matchScore"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Gemini Outfit Gen Error:", error);
    throw error;
  }
};