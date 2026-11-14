import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TempUnit, WeatherDashboardData, WindUnit } from '../../models/weather.model';
import { WeatherService } from '../../services/weather.service';
import { WeatherIconComponent } from '../weather-icon/weather-icon.component';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  template: `
    <section *ngIf="data" class="bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden">
      <!-- Subtle top glow -->
      <div class="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

      <div>
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111115] border border-[#27272A] text-[11px] font-mono-tabular text-zinc-400 mb-3">
              {{ data.location.latitude.toFixed(2) }}°, {{ data.location.longitude.toFixed(2) }}°
            </span>
            <h2 class="text-2xl sm:text-3xl font-bold text-white font-display">
              {{ data.location.name }}
            </h2>
            <p class="text-sm text-zinc-400 mt-0.5">
              {{ data.location.admin1 ? data.location.admin1 + ', ' : '' }}{{ data.location.country }}
            </p>
          </div>

          <app-weather-icon
            [code]="data.current.weatherCode"
            [isDay]="data.current.isDay"
            [size]="64"
          />
        </div>

        <!-- Primary Temperature -->
        <div class="mt-6 flex items-baseline gap-4">
          <div class="text-6xl sm:text-7xl font-bold tracking-tighter text-white font-mono-tabular">
            {{ weatherService.formatTemp(data.current.tempC, tempUnit) }}°
          </div>
          <div class="space-y-1">
            <div class="text-base font-semibold text-cyan-300">
              {{ weatherService.getWeatherDescription(data.current.weatherCode) }}
            </div>
            <div class="text-xs text-zinc-400 font-mono-tabular">
              Feels like {{ weatherService.formatTemp(data.current.apparentTempC, tempUnit) }}°{{ tempUnit }}
            </div>
          </div>
        </div>
      </div>

      <!-- High / Low & Quick Stats -->
      <div class="mt-6 pt-5 border-t border-[#1F1F24] grid grid-cols-3 gap-3">
        <div class="bg-[#111115] border border-[#27272A] rounded-xl p-3">
          <div class="text-[11px] text-zinc-500 uppercase tracking-wider">Today H / L</div>
          <div class="text-sm font-semibold text-zinc-100 font-mono-tabular mt-1">
            {{ weatherService.formatTemp(data.daily[0].tempMaxC, tempUnit) }}° /
            {{ weatherService.formatTemp(data.daily[0].tempMinC, tempUnit) }}°
          </div>
        </div>

        <div class="bg-[#111115] border border-[#27272A] rounded-xl p-3">
          <div class="text-[11px] text-zinc-500 uppercase tracking-wider">Wind</div>
          <div class="text-sm font-semibold text-emerald-300 font-mono-tabular mt-1">
            {{ weatherService.formatWind(data.current.windSpeedKmh, windUnit) }} {{ windUnit }}
          </div>
        </div>

        <div class="bg-[#111115] border border-[#27272A] rounded-xl p-3">
          <div class="text-[11px] text-zinc-500 uppercase tracking-wider">Humidity</div>
          <div class="text-sm font-semibold text-cyan-300 font-mono-tabular mt-1">
            {{ data.current.humidity }}%
          </div>
        </div>
      </div>
    </section>
  `
})
export class CurrentWeatherComponent {
  weatherService = inject(WeatherService);

  @Input() data: WeatherDashboardData | null = null;
  @Input() tempUnit: TempUnit = 'C';
  @Input() windUnit: WindUnit = 'kmh';
}
