import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentWeather, WindUnit } from '../../models/weather.model';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-atmospheric-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section *ngIf="current" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Wind Compass Card -->
      <div class="bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Wind Vector</div>
          <div class="text-2xl font-bold text-white font-mono-tabular mt-2">
            {{ weatherService.formatWind(current.windSpeedKmh, windUnit) }}
            <span class="text-sm font-normal text-zinc-400">{{ windUnit }}</span>
          </div>
          <div class="text-xs text-emerald-400 font-mono-tabular mt-1">
            {{ weatherService.getCardinalDirection(current.windDirectionDeg) }} ({{ current.windDirectionDeg }}°)
          </div>
        </div>

        <!-- SVG Compass -->
        <svg viewBox="0 0 80 80" class="w-16 h-16 shrink-0">
          <circle cx="40" cy="40" r="34" fill="#111115" stroke="#27272A" stroke-width="2" />
          <text x="40" y="15" text-anchor="middle" class="text-[8px] font-mono-tabular fill-zinc-400 font-bold">N</text>
          <text x="66" y="43" text-anchor="middle" class="text-[8px] font-mono-tabular fill-zinc-500">E</text>
          <text x="40" y="71" text-anchor="middle" class="text-[8px] font-mono-tabular fill-zinc-500">S</text>
          <text x="14" y="43" text-anchor="middle" class="text-[8px] font-mono-tabular fill-zinc-500">W</text>
          <g [attr.transform]="'rotate(' + current.windDirectionDeg + ' 40 40)'">
            <line x1="40" y1="56" x2="40" y2="22" stroke="#34D399" stroke-width="2.5" stroke-linecap="round" />
            <polygon points="40,18 35,27 45,27" fill="#34D399" />
          </g>
        </svg>
      </div>

      <!-- Humidity Radial Gauge -->
      <div class="bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Humidity</div>
          <div class="text-2xl font-bold text-white font-mono-tabular mt-2">
            {{ current.humidity }}%
          </div>
          <div class="text-xs text-cyan-400 mt-1">
            {{ current.humidity > 70 ? 'High Moisture' : current.humidity < 35 ? 'Dry Air' : 'Optimal Comfort' }}
          </div>
        </div>

        <svg viewBox="0 0 80 80" class="w-16 h-16 shrink-0 -rotate-90">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#1F1F24" stroke-width="7" />
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="#22D3EE"
            stroke-width="7"
            stroke-linecap="round"
            [attr.stroke-dasharray]="188.5"
            [attr.stroke-dashoffset]="188.5 - (188.5 * current.humidity) / 100"
          />
        </svg>
      </div>

      <!-- UV Index -->
      <div class="bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-zinc-400 uppercase tracking-wider">UV Index</span>
          <span class="text-xs font-mono-tabular px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {{ uvLabel }}
          </span>
        </div>
        <div class="text-2xl font-bold text-white font-mono-tabular my-2">
          {{ current.uvIndex.toFixed(1) }}
        </div>
        <div class="w-full h-2 rounded-full bg-[#111115] overflow-hidden border border-[#27272A]">
          <div
            class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all"
            [style.width.%]="Math.min((current.uvIndex / 11) * 100, 100)"
          ></div>
        </div>
      </div>

      <!-- Pressure -->
      <div class="bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-5">
        <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Barometric Pressure</div>
        <div class="text-2xl font-bold text-white font-mono-tabular mt-2">
          {{ Math.round(current.pressureHpa) }} <span class="text-sm font-normal text-zinc-400">hPa</span>
        </div>
        <div class="text-xs text-zinc-400 mt-1">
          {{ current.pressureHpa >= 1013 ? 'High-pressure system' : 'Low-pressure system' }}
        </div>
      </div>

      <!-- Visibility -->
      <div class="bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-5">
        <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Visibility</div>
        <div class="text-2xl font-bold text-white font-mono-tabular mt-2">
          {{ current.visibilityKm }} <span class="text-sm font-normal text-zinc-400">km</span>
        </div>
        <div class="text-xs text-zinc-400 mt-1">
          {{ current.visibilityKm >= 10 ? 'Unobstructed horizon' : 'Reduced clarity' }}
        </div>
      </div>

      <!-- Cloud Cover -->
      <div class="bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-5">
        <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Cloud Cover</div>
        <div class="text-2xl font-bold text-white font-mono-tabular mt-2">
          {{ current.cloudCover }}%
        </div>
        <div class="text-xs text-zinc-400 mt-1">
          {{ current.cloudCover < 25 ? 'Clear skies' : current.cloudCover < 70 ? 'Scattered clouds' : 'Dense overcast' }}
        </div>
      </div>
    </section>
  `
})
export class AtmosphericGridComponent {
  weatherService = inject(WeatherService);
  Math = Math;

  @Input() current: CurrentWeather | null = null;
  @Input() windUnit: WindUnit = 'kmh';

  get uvLabel(): string {
    const uv = this.current?.uvIndex ?? 0;
    if (uv < 3) return 'Low';
    if (uv < 6) return 'Moderate';
    if (uv < 8) return 'High';
    if (uv < 11) return 'Very High';
    return 'Extreme';
  }
}
