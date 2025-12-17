import React from 'react';
import { CloudRain, CloudSun, Sun, Wind, Droplets, Thermometer } from 'lucide-react';
import { WeatherData, WeatherCondition } from '../types';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  isLoading: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, isLoading }) => {
  if (isLoading) {
    return <div className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>;
  }

  if (!weather) return null;

  const getIcon = (condition: WeatherCondition) => {
    switch (condition) {
      case WeatherCondition.RAINY: return <CloudRain className="w-10 h-10 text-blue-500" />;
      case WeatherCondition.CLOUDY: return <CloudSun className="w-10 h-10 text-slate-500" />;
      case WeatherCondition.SUNNY: return <Sun className="w-10 h-10 text-orange-500" />;
      case WeatherCondition.WINDY: return <Wind className="w-10 h-10 text-teal-500" />;
      default: return <Sun className="w-10 h-10 text-orange-500" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
          {getIcon(weather.condition)}
        </div>
        <div>
          <h2 className="text-sm font-medium text-indigo-100 uppercase tracking-wider">{weather.location}</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{weather.temperature}°</span>
            <span className="text-lg text-indigo-100">{weather.condition}</span>
          </div>
          <p className="text-sm text-indigo-100 mt-1 max-w-md">{weather.description}</p>
        </div>
      </div>

      <div className="mt-6 md:mt-0 flex gap-8 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-8">
        <div className="flex flex-col items-center">
          <Droplets className="w-5 h-5 text-indigo-200 mb-1" />
          <span className="text-lg font-semibold">{weather.humidity}%</span>
          <span className="text-xs text-indigo-200">습도</span>
        </div>
        <div className="flex flex-col items-center">
          <Sun className="w-5 h-5 text-indigo-200 mb-1" />
          <span className="text-lg font-semibold">{weather.uvIndex}</span>
          <span className="text-xs text-indigo-200">자외선</span>
        </div>
        <div className="flex flex-col items-center">
          <Thermometer className="w-5 h-5 text-indigo-200 mb-1" />
          <span className="text-lg font-semibold">{weather.temperature + 2}°</span>
          <span className="text-xs text-indigo-200">체감</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;