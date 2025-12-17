export enum ClothingCategory {
  TOP = 'Top',
  BOTTOM = 'Bottom',
  OUTERWEAR = 'Outerwear',
  SHOES = 'Shoes',
  ACCESSORY = 'Accessory',
  DRESS = 'Dress',
  OTHER = 'Other'
}

// Helper to translate categories to Korean
export const CategoryLabels: Record<ClothingCategory, string> = {
  [ClothingCategory.TOP]: '상의',
  [ClothingCategory.BOTTOM]: '하의',
  [ClothingCategory.OUTERWEAR]: '아우터',
  [ClothingCategory.SHOES]: '신발',
  [ClothingCategory.ACCESSORY]: '액세서리',
  [ClothingCategory.DRESS]: '원피스',
  [ClothingCategory.OTHER]: '기타',
};

export enum WeatherCondition {
  SUNNY = 'Sunny',
  CLOUDY = 'Cloudy',
  RAINY = 'Rainy',
  SNOWY = 'Snowy',
  WINDY = 'Windy'
}

export interface ClothingItem {
  id: string;
  imageUrl: string; // Base64 or URL
  category: ClothingCategory;
  color: string;
  season: string[]; // e.g., ['Summer', 'Spring']
  material?: string; // e.g., "60% Cotton, 40% Polyester"
  careInstructions?: string; // e.g., "Machine wash cold"
  wearCount: number;
  brand?: string;
  purchaseDate?: string;
}

export interface WeatherData {
  temperature: number; // Celsius
  condition: WeatherCondition;
  humidity: number;
  uvIndex: number;
  location: string;
  description: string;
  // New detailed fields
  tempHigh: number;
  tempLow: number;
  precipChance: number; // Percentage
  windSpeed: number; // km/h
}

export interface OutfitRecommendation {
  topId: string;
  bottomId: string;
  outerwearId?: string; // Optional
  reasoning: string;
  styleName: string;
  matchScore: number;
}

export interface DailyLog {
  date: string; // ISO Date string YYYY-MM-DD
  weather: WeatherData;
  outfit: {
    top: ClothingItem;
    bottom: ClothingItem;
    outerwear?: ClothingItem;
  };
  feedback?: {
    rating: number; // 0-5
    comment?: string;
  };
}

// AI Service Responses
export interface ClothingAnalysisResult {
  category: string;
  color: string;
  season: string[];
  material: string;
  careInstructions: string;
  description: string;
}