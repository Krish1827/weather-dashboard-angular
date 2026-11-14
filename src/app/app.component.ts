import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CityLocation,
  TempUnit,
  WeatherDashboardData,
  WindUnit
} from './models/weather.model';
import { WeatherService } from './services/weather.service';
import { HeaderComponent } from './components/header/header.component';
import { CurrentWeatherComponent } from './components/current-weather/current-weather.component';
import { TelemetryChartComponent } from './components/telemetry-chart/telemetry-chart.component';
import { AtmosphericGridComponent } from './components/atmospheric-grid/atmospheric-grid.component';
import { DailyForecastComponent } from './components/daily-forecast/daily-forecast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CurrentWeatherComponent,
    TelemetryChartComponent,
    AtmosphericGridComponent,
    DailyForecastComponent
  ],
  template: `
    <div class="min-h-screen bg-black text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div class="max-w-7xl mx-auto space-y-5">
        <!-- Command Header -->
        <app-header
          [activeLocation]="activeLocation"
          [pinnedCities]="pinnedCities"
          [tempUnit]="tempUnit"
          [windUnit]="windUnit"
          [loading]="loading"
          (selectCity)="loadCity($event)"
          (togglePin)="onTogglePin($event)"
          (tempUnitChange)="tempUnit = $event"
          (windUnitChange)="windUnit = $event"
          (useMyLocation)="onUseMyLocation()"
          (refresh)="onRefresh()"
        />

        <!-- Error Banner -->
        <div
          *ngIf="errorMessage"
          class="bg-rose-950/40 border border-rose-500/40 text-rose-200 px-4 py-3 rounded-xl text-sm flex items-center justify-between"
        >
          <span>{{ errorMessage }}</span>
          <button type="button" (click)="errorMessage = ''" class="text-xs underline ml-4">Dismiss</button>
        </div>

        <!-- Bento Grid Content -->
        <ng-container *ngIf="weatherData">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div class="lg:col-span-4">
              <app-current-weather
                [data]="weatherData"
                [tempUnit]="tempUnit"
                [windUnit]="windUnit"
              />
            </div>

            <div class="lg:col-span-8">
              <app-telemetry-chart
                [hourly]="weatherData.hourly"
                [tempUnit]="tempUnit"
                [windUnit]="windUnit"
              />
            </div>
          </div>

          <app-atmospheric-grid
            [current]="weatherData.current"
            [windUnit]="windUnit"
          />

          <app-daily-forecast
            [daily]="weatherData.daily"
            [weekMinC]="weatherData.weekMinC"
            [weekMaxC]="weatherData.weekMaxC"
            [tempUnit]="tempUnit"
            [windUnit]="windUnit"
          />
        </ng-container>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  private weatherService = inject(WeatherService);

  pinnedCities: CityLocation[] = [...this.weatherService.defaultPinnedCities];
  activeLocation: CityLocation = this.pinnedCities[0];
  weatherData: WeatherDashboardData | null = null;

  tempUnit: TempUnit = 'C';
  windUnit: WindUnit = 'kmh';
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadCity(this.activeLocation);
  }

  loadCity(city: CityLocation): void {
    this.activeLocation = city;
    this.loading = true;
    this.errorMessage = '';

    this.weatherService.getWeatherForLocation(city).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to fetch live forecast data. Please try again.';
        this.loading = false;
      }
    });
  }

  onRefresh(): void {
    if (this.activeLocation) {
      this.loadCity(this.activeLocation);
    }
  }

  onTogglePin(city: CityLocation): void {
    const idx = this.pinnedCities.findIndex(
      (c) => Math.abs(c.latitude - city.latitude) < 0.05 && Math.abs(c.longitude - city.longitude) < 0.05
    );
    if (idx >= 0) {
      if (this.pinnedCities.length > 1) {
        this.pinnedCities = this.pinnedCities.filter((_, i) => i !== idx);
      }
    } else {
      this.pinnedCities = [...this.pinnedCities, city];
    }
  }

  onUseMyLocation(): void {
    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocation is not supported by your browser.';
      return;
    }
    this.loading = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geoCity: CityLocation = {
          id: 'current-geo',
          name: 'Current Location',
          country: 'GPS Coordinates',
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4))
        };
        this.loadCity(geoCity);
      },
      () => {
        this.loading = false;
        this.errorMessage = 'Location access was denied or unavailable.';
      }
    );
  }
}
