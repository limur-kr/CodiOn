import type { ClothingAnalysisResult, ClothingItem, OutfitRecommendation, WeatherData } from '../types';
import { callN8NWebhook } from './n8nService';
import { analyzeClothingImage as analyzeClothingImageDirect, generateOutfitSuggestion as generateOutfitSuggestionDirect } from './geminiService';

type Env = {
  VITE_N8N_ANALYZE_IMAGE_WEBHOOK_URL?: string;
  VITE_N8N_OUTFIT_WEBHOOK_URL?: string;
};

const env = (import.meta as any).env as Env | undefined;

function hasValue(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * 분석(옷 이미지 → 메타데이터)
 *
 * - n8n을 쓰면: VITE_N8N_ANALYZE_IMAGE_WEBHOOK_URL 를 설정하세요.
 * - 설정이 없으면: 기존 브라우저 직접 Gemini 호출로 fallback 합니다.
 */
export async function analyzeClothingImage(base64Image: string): Promise<ClothingAnalysisResult> {
  const webhookUrl = env?.VITE_N8N_ANALYZE_IMAGE_WEBHOOK_URL;
  if (hasValue(webhookUrl)) {
    return await callN8NWebhook<ClothingAnalysisResult>(webhookUrl, {
      imageBase64: base64Image,
      // n8n에서 prompt를 무시해도 되고, 그대로 Gemini에 전달해도 됩니다.
      prompt:
        "Analyze this clothing item. Identify the category (Top, Bottom, Outerwear, Shoes, Dress, Accessory), dominant color, suitable seasons (Summer, Winter, Spring, Autumn). Estimate the material composition (e.g., '100% Cotton') and provide short standard care instructions (e.g., 'Machine wash cold'). Write a 1-sentence description. IMPORTANT: Provide 'material', 'careInstructions', and 'description' in KOREAN. Return JSON keys: category,color,season,material,careInstructions,description.",
    });
  }

  // fallback (기존 방식)
  return await analyzeClothingImageDirect(base64Image);
}

/**
 * 추천(날씨+옷장 → 코디 추천)
 *
 * - n8n을 쓰면: VITE_N8N_OUTFIT_WEBHOOK_URL 를 설정하세요.
 * - 설정이 없으면: 기존 브라우저 직접 Gemini 호출로 fallback 합니다.
 */
export async function generateOutfitSuggestion(
  weather: WeatherData,
  closet: ClothingItem[]
): Promise<OutfitRecommendation> {
  const webhookUrl = env?.VITE_N8N_OUTFIT_WEBHOOK_URL;
  if (hasValue(webhookUrl)) {
    const closetManifest = closet
      .map(
        (item) =>
          `- ID: ${item.id}, Type: ${item.category}, Color: ${item.color}, Season: ${item.season.join(
            '/'
          )}, Material: ${item.material || 'Unknown'}`
      )
      .join('\n');

    const weatherContext = `Temperature: ${weather.temperature}°C, Condition: ${weather.condition}, Humidity: ${weather.humidity}%, UV: ${weather.uvIndex}. Description: ${weather.description}`;

    return await callN8NWebhook<OutfitRecommendation>(webhookUrl, {
      weather,
      closet,
      closetManifest,
      weatherContext,
      prompt: `
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
6. IMPORTANT: Provide 'reasoning' and 'styleName' in KOREAN.

Return JSON keys: topId, bottomId, outerwearId (nullable), reasoning, styleName, matchScore
      `.trim(),
    });
  }

  // fallback (기존 방식)
  return await generateOutfitSuggestionDirect(weather, closet);
}


