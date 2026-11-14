import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  CityLocation,
  DailyForecastItem,
  HourlyPoint,
  WeatherDashboardData
} from '../models/weather.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);

  readonly defaultPinnedCities: CityLocation[] = [
    { id: 'brampton-ca', name: 'Brampton', admin1: 'Ontario', country: 'Canada', latitude: 43.6834, longitude: -79.7663 },
    { id: 'toronto-ca', name: 'Toronto', admin1: 'Ontario', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
    { id: 'calgary-ca', name: 'Calgary', admin1: 'Alberta', country: 'Canada', latitude: 51.0447, longitude: -114.0719 },
    { id: 'ahmedabad-in', name: 'Ahmedabad', admin1: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714 },
    { id: 'tokyo-jp', name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
    { id: 'newyork-us', name: 'New York', admin1: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
    { id: 'london-uk', name: 'London', admin1: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 }
  ];

  searchCities(query: string): Observable<CityLocation[]> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    return this.http.get<any>(url).pipe(
      map((res) => {
        if (!res?.results) return [];
        return res.results.map((item: any) => ({
          id: `${item.id ?? `${item.latitude}-${item.longitude}`}`,
          name: item.name,
          admin1: item.admin1,
          country: item.country,
          latitude: item.latitude,
          longitude: item.longitude,
          timezone: item.timezone
        }));
      })
    );
  }

  getWeatherForLocation(location: CityLocation): Observable<WeatherDashboardData> {
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'weather_code',
        'cloud_cover',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'visibility',
        'uv_index'
      ].join(','),
      hourly: [
        'temperature_2m',
        'precipitation_probability',
        'weather_code',
        'wind_speed_10m',
        'uv_index',
        'is_day'
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max'
      ].join(','),
      timezone: 'auto',
      forecast_days: '7'
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

    return this.http.get<any>(url).pipe(
      map((data) => this.mapApiResponse(location, data))
    );
  }

  private mapApiResponse(location: CityLocation, data: any): WeatherDashboardData {
    const c = data.current;
    const h = data.hourly;
    const d = data.daily;

    // Find starting index for next 24 hours based on current API time
    const currentHourPrefix = (c.time as string).slice(0, 13);
    let startIdx = (h.time as string[]).findIndex((t) => t.startsWith(currentHourPrefix));
    if (startIdx < 0) startIdx = 0;

    const hourly: HourlyPoint[] = [];
    for (let i = startIdx; i < Math.min(startIdx + 24, h.time.length); i++) {
      const timeStr: string = h.time[i];
      const hourPart = timeStr.split('T')[1]?.slice(0, 5) ?? '00:00';
      hourly.push({
        time: timeStr,
        hourLabel: i === startIdx ? 'NOW' : hourPart,
        tempC: h.temperature_2m[i],
        precipProb: h.precipitation_probability[i] ?? 0,
        windKmh: h.wind_speed_10m[i] ?? 0,
        uvIndex: h.uv_index[i] ?? 0,
        weatherCode: h.weather_code[i] ?? 0,
        isDay: h.is_day[i] === 1
      });
    }

    const daily: DailyForecastItem[] = (d.time as string[]).map((dateStr, idx) => {
      const dateObj = new Date(`${dateStr}T12:00:00`);
      const dayName = idx === 0
        ? 'Today'
        : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const sunriseTime = (d.sunrise[idx] as string)?.split('T')[1] ?? '06:30';
      const sunsetTime = (d.sunset[idx] as string)?.split('T')[1] ?? '18:30';

      return {
        date: dateStr,
        dayName,
        shortDate,
        weatherCode: d.weather_code[idx],
        tempMaxC: d.temperature_2m_max[idx],
        tempMinC: d.temperature_2m_min[idx],
        precipSumMm: d.precipitation_sum[idx] ?? 0,
        precipProbMax: d.precipitation_probability_max[idx] ?? 0,
        windMaxKmh: d.wind_speed_10m_max[idx] ?? 0,
        uvIndexMax: d.uv_index_max[idx] ?? 0,
        sunrise: sunriseTime,
        sunset: sunsetTime
      };
    });

    const weekMinC = Math.min(...daily.map((item) => item.tempMinC));
    const weekMaxC = Math.max(...daily.map((item) => item.tempMaxC));

    return {
      location: {
        ...location,
        timezone: data.timezone
      },
      current: {
        tempC: c.temperature_2m,
        apparentTempC: c.apparent_temperature,
        humidity: c.relative_humidity_2m,
        windSpeedKmh: c.wind_speed_10m,
        windDirectionDeg: c.wind_direction_10m,
        pressureHpa: c.surface_pressure,
        visibilityKm: Math.round((c.visibility ?? 10000) / 100) / 10,
        cloudCover: c.cloud_cover,
        uvIndex: c.uv_index ?? 0,
        weatherCode: c.weather_code,
        isDay: c.is_day === 1
      },
      hourly,
      daily,
      weekMinC,
      weekMaxC
    };
  }

  getWeatherDescription(code: number): string {
    const descriptions: Record<number, string> = {
      0: 'Clear Sky',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing Rime Fog',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      56: 'Light Freezing Drizzle',
      57: 'Dense Freezing Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      66: 'Light Freezing Rain',
      67: 'Heavy Freezing Rain',
      71: 'Slight Snowfall',
      73: 'Moderate Snowfall',
      75: 'Heavy Snowfall',
      77: 'Snow Grains',
      80: 'Slight Rain Showers',
      81: 'Moderate Rain Showers',
      82: 'Violent Rain Showers',
      85: 'Slight Snow Showers',
      86: 'Heavy Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Slight Hail',
      99: 'Thunderstorm with Heavy Hail'
    };
    return descriptions[code] ?? 'Clear Conditions';
  }

  formatTemp(tempC: number, unit: 'C' | 'F'): number {
    if (unit === 'F') {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  }

  formatWind(kmh: number, unit: 'kmh' | 'mph'): number {
    if (unit === 'mph') {
      return Math.round(kmh * 0.621371);
    }
    return Math.round(kmh);
  }

  getCardinalDirection(deg: number): string {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  }
}
