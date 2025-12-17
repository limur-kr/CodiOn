import { WeatherData, WeatherCondition } from '../types';

// In a real app, this would fetch from OpenWeatherMap or similar.
export const getCurrentWeather = async (): Promise<WeatherData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        temperature: 22,
        condition: WeatherCondition.SUNNY,
        humidity: 45,
        uvIndex: 6,
        location: "Seoul, KR",
        description: "구름이 조금 있는 맑은 날씨입니다. 가벼운 옷차림이 좋습니다.",
        tempHigh: 25,
        tempLow: 18,
        precipChance: 5,
        windSpeed: 5
      });
    }, 500);
  });
};

export const getForecast = async (): Promise<WeatherData[]> => {
    // Returns a 5-day mock forecast
    return [
        { temperature: 22, condition: WeatherCondition.SUNNY, humidity: 45, uvIndex: 6, location: "Seoul", description: "", tempHigh: 25, tempLow: 18, precipChance: 0, windSpeed: 5 },
        { temperature: 19, condition: WeatherCondition.CLOUDY, humidity: 60, uvIndex: 3, location: "Seoul", description: "", tempHigh: 21, tempLow: 16, precipChance: 20, windSpeed: 10 },
        { temperature: 18, condition: WeatherCondition.RAINY, humidity: 80, uvIndex: 1, location: "Seoul", description: "", tempHigh: 19, tempLow: 15, precipChance: 80, windSpeed: 15 },
        { temperature: 24, condition: WeatherCondition.SUNNY, humidity: 40, uvIndex: 7, location: "Seoul", description: "", tempHigh: 27, tempLow: 20, precipChance: 0, windSpeed: 4 },
        { temperature: 21, condition: WeatherCondition.WINDY, humidity: 50, uvIndex: 5, location: "Seoul", description: "", tempHigh: 23, tempLow: 17, precipChance: 10, windSpeed: 25 },
    ]
}