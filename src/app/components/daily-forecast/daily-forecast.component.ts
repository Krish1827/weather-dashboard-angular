import { Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyForecastItem, TempUnit, WindUnit } from '../../models/weather.model';
import { WeatherService } from '../../services/weather.service';
import { WeatherIconComponent } from '../weather-icon/weather-icon.component';

@Component({
  selector: 'app-daily-forecast',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  template: `
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- 7-Day Interactive List -->
      <div class="lg:col-span-7 bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-white font-display">7-Day Outlook</h3>
          <span class="text-xs text-zinc-400">Click a day for details</span>
        </div>

        <div class="space-y-2">
          <button
            *ngFor="let day of daily; let idx = index"
            type="button"
            (click)="selectedDayIndex = idx"
            [class]="selectedDayIndex === idx
              ? 'bg-[#16161B] border-cyan-500/50'
              : 'bg-[#111115] border-[#27272A] hover:border-zinc-600'"
            class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all text-left"
          >
            <!-- Day & Date -->
            <div class="w-24 shrink-0">
              <div class="text-sm font-semibold text-zinc-100">{{ day.dayName }}</div>
              <div class="text-[11px] text-zinc-500 font-mono-tabular">{{ day.shortDate }}</div>
            </div>

            <!-- Icon & Precip -->
            <div class="flex items-center gap-2.5 w-24 shrink-0">
              <app-weather-icon [code]="day.weatherCode" [isDay]="true" [size]="28" />
              <span *ngIf="day.precipProbMax > 0" class="text-xs font-mono-tabular text-sky-400">
                {{ day.precipProbMax }}%
              </span>
            </div>

            <!-- Proportional Temperature Range Bar -->
            <div class="flex-1 flex items-center gap-3">
              <span class="text-xs font-mono-tabular text-zinc-400 w-8 text-right">
                {{ weatherService.formatTemp(day.tempMinC, tempUnit) }}°
              </span>
              <div class="flex-1 h-1.5 rounded-full bg-zinc-800 relative overflow-hidden">
                <div
                  class="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 to-amber-400"
                  [style.left.%]="getBarLeft(day)"
                  [style.width.%]="getBarWidth(day)"
                ></div>
              </div>
              <span class="text-xs font-mono-tabular text-zinc-100 font-semibold w-8">
                {{ weatherService.formatTemp(day.tempMaxC, tempUnit) }}°
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- Selected Day Breakdown Panel -->
      <div *ngIf="selectedDay" class="lg:col-span-5 bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-[#1F1F24]">
            <div>
              <span class="text-xs uppercase tracking-wider text-cyan-400 font-semibold">Selected Day Breakdown</span>
              <h4 class="text-xl font-bold text-white font-display mt-0.5">
                {{ selectedDay.dayName }} • {{ selectedDay.shortDate }}
              </h4>
              <p class="text-xs text-zinc-400 mt-0.5">
                {{ weatherService.getWeatherDescription(selectedDay.weatherCode) }}
              </p>
            </div>
            <app-weather-icon [code]="selectedDay.weatherCode" [isDay]="true" [size]="48" />
          </div>

          <div class="grid grid-cols-2 gap-3 mt-5">
            <div class="bg-[#111115] border border-[#27272A] rounded-xl p-3.5">
              <div class="text-[11px] text-zinc-500 uppercase">Day / Night</div>
              <div class="text-base font-bold text-zinc-100 font-mono-tabular mt-1">
                {{ weatherService.formatTemp(selectedDay.tempMaxC, tempUnit) }}° /
                {{ weatherService.formatTemp(selectedDay.tempMinC, tempUnit) }}°
              </div>
            </div>

            <div class="bg-[#111115] border border-[#27272A] rounded-xl p-3.5">
              <div class="text-[11px] text-zinc-500 uppercase">Precipitation</div>
              <div class="text-base font-bold text-sky-400 font-mono-tabular mt-1">
                {{ selectedDay.precipSumMm.toFixed(1) }} mm ({{ selectedDay.precipProbMax }}%)
              </div>
            </div>

            <div class="bg-[#111115] border border-[#27272A] rounded-xl p-3.5">
              <div class="text-[11px] text-zinc-500 uppercase">Peak Wind</div>
              <div class="text-base font-bold text-emerald-400 font-mono-tabular mt-1">
                {{ weatherService.formatWind(selectedDay.windMaxKmh, windUnit) }} {{ windUnit }}
              </div>
            </div>

            <div class="bg-[#111115] border border-[#27272A] rounded-xl p-3.5">
              <div class="text-[11px] text-zinc-500 uppercase">Peak UV Index</div>
              <div class="text-base font-bold text-amber-400 font-mono-tabular mt-1">
                {{ selectedDay.uvIndexMax.toFixed(1) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Sunrise & Sunset Footer -->
        <div class="mt-5 pt-4 border-t border-[#1F1F24] grid grid-cols-2 gap-3">
          <div class="flex items-center justify-between bg-[#111115] border border-[#27272A] rounded-xl px-4 py-3">
            <span class="text-xs text-zinc-400">Sunrise</span>
            <span class="text-sm font-semibold text-amber-300 font-mono-tabular">{{ selectedDay.sunrise }}</span>
          </div>
          <div class="flex items-center justify-between bg-[#111115] border border-[#27272A] rounded-xl px-4 py-3">
            <span class="text-xs text-zinc-400">Sunset</span>
            <span class="text-sm font-semibold text-orange-400 font-mono-tabular">{{ selectedDay.sunset }}</span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class DailyForecastComponent implements OnChanges {
  weatherService = inject(WeatherService);

  @Input() daily: DailyForecastItem[] = [];
  @Input() weekMinC = 0;
  @Input() weekMaxC = 30;
  @Input() tempUnit: TempUnit = 'C';
  @Input() windUnit: WindUnit = 'kmh';

  selectedDayIndex = 0;

  get selectedDay(): DailyForecastItem | null {
    return this.daily[this.selectedDayIndex] ?? null;
  }

  ngOnChanges(): void {
    if (this.selectedDayIndex >= this.daily.length) {
      this.selectedDayIndex = 0;
    }
  }

  getBarLeft(day: DailyForecastItem): number {
    const span = this.weekMaxC - this.weekMinC || 1;
    return Math.max(0, Math.min(100, ((day.tempMinC - this.weekMinC) / span) * 100));
  }

  getBarWidth(day: DailyForecastItem): number {
    const span = this.weekMaxC - this.weekMinC || 1;
    const width = ((day.tempMaxC - day.tempMinC) / span) * 100;
    return Math.max(8, Math.min(100, width));
  }
}
