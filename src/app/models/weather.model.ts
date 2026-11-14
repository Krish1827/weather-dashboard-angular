export type TempUnit = 'C' | 'F';
export type WindUnit = 'kmh' | 'mph';
export type ChartMetric = 'temp' | 'precip' | 'wind' | 'uv';

export interface CityLocation {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface HourlyPoint {
  time: string;
  hourLabel: string;
  tempC: number;
  precipProb: number;
  windKmh: number;
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  shortDate: string;
  weatherCode: number;
  tempMaxC: number;
  tempMinC: number;
  precipSumMm: number;
  precipProbMax: number;
  windMaxKmh: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface CurrentWeather {
  tempC: number;
  apparentTempC: number;
  humidity: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  pressureHpa: number;
  visibilityKm: number;
  cloudCover: number;
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
}

export interface WeatherDashboardData {
  location: CityLocation;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyForecastItem[];
  weekMinC: number;
  weekMaxC: number;
}
