import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye } from 'lucide-react';

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    pressure: number;
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    temp: { min: number; max: number };
    description: string;
    icon: string;
  }>;
}

interface WeatherWidgetProps {
  city?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ city = 'London' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/widgets/weather?city=${city}`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeather(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [city]);

  const getWeatherIcon = (icon: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '01d': <Sun className="w-8 h-8 text-yellow-500" />,
      '01n': <Sun className="w-8 h-8 text-yellow-500" />,
      '02d': <Cloud className="w-8 h-8 text-gray-500" />,
      '02n': <Cloud className="w-8 h-8 text-gray-500" />,
      '03d': <Cloud className="w-8 h-8 text-gray-500" />,
      '03n': <Cloud className="w-8 h-8 text-gray-500" />,
      '04d': <Cloud className="w-8 h-8 text-gray-500" />,
      '04n': <Cloud className="w-8 h-8 text-gray-500" />,
      '09d': <CloudRain className="w-8 h-8 text-blue-500" />,
      '09n': <CloudRain className="w-8 h-8 text-blue-500" />,
      '10d': <CloudRain className="w-8 h-8 text-blue-500" />,
      '10n': <CloudRain className="w-8 h-8 text-blue-500" />,
      '11d': <CloudRain className="w-8 h-8 text-blue-500" />,
      '11n': <CloudRain className="w-8 h-8 text-blue-500" />,
      '13d': <CloudSnow className="w-8 h-8 text-blue-300" />,
      '13n': <CloudSnow className="w-8 h-8 text-blue-300" />,
      '50d': <Cloud className="w-8 h-8 text-gray-500" />,
      '50n': <Cloud className="w-8 h-8 text-gray-500" />,
    };
    return iconMap[icon] || <Cloud className="w-8 h-8 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="widget">
        <div className="widget-header">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary-600" />
            <h3 className="widget-title">Weather</h3>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="loading-pulse text-gray-500">Loading weather...</div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="widget">
        <div className="widget-header">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary-600" />
            <h3 className="widget-title">Weather</h3>
          </div>
        </div>
        <div className="text-center py-8 text-red-500">
          <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Failed to load weather</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary-600" />
          <h3 className="widget-title">Weather</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{city}</div>
      </div>

      <div className="space-y-4">
        {/* Current Weather */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getWeatherIcon(weather.current.icon)}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {weather.current.temp}°C
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {weather.current.description}
          </div>
        </div>

        {/* Current Details */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="metric-card">
            <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="metric-value text-sm">{weather.current.humidity}%</div>
            <div className="metric-label">Humidity</div>
          </div>
          <div className="metric-card">
            <Wind className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <div className="metric-value text-sm">{weather.current.pressure}</div>
            <div className="metric-label">Pressure</div>
          </div>
          <div className="metric-card">
            <Eye className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <div className="metric-value text-sm">Good</div>
            <div className="metric-label">Visibility</div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">5-Day Forecast</div>
          {weather.forecast.map((day, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className="flex items-center gap-3">
                {getWeatherIcon(day.icon)}
                <div>
                  <div className="text-sm font-medium">{formatDate(day.date)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {day.description}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold">
                {day.temp.max}° / {day.temp.min}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
