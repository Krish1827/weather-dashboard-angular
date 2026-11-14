import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CityLocation, TempUnit, WindUnit } from '../../models/weather.model';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-4 sm:p-5 space-y-4">
      <!-- Top Row: Brand, Search, Actions, Toggles -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- Brand Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-white font-display">Weather</h1>
          </div>
        </div>

        <!-- Search & Command Controls -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Search Input -->
          <div class="relative flex-1 sm:flex-initial sm:w-64">
            <div class="relative">
              <svg class="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                (focus)="showDropdown = searchResults.length > 0"
                placeholder="Search city..."
                class="w-full bg-[#111115] border border-[#27272A] focus:border-cyan-500/60 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
              />
            </div>

            <!-- Autocomplete Dropdown -->
            <div
              *ngIf="showDropdown && searchResults.length > 0"
              class="absolute z-50 mt-1.5 w-full bg-[#111115] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden"
            >
              <button
                *ngFor="let item of searchResults"
                type="button"
                (click)="selectSearchResult(item)"
                class="w-full text-left px-3.5 py-2.5 hover:bg-zinc-800/80 transition-colors border-b border-zinc-800/50 last:border-none flex flex-col"
              >
                <span class="text-sm font-medium text-zinc-100">{{ item.name }}</span>
                <span class="text-xs text-zinc-400">
                  {{ item.admin1 ? item.admin1 + ', ' : '' }}{{ item.country }}
                </span>
              </button>
            </div>
          </div>

          <!-- Use My Location -->
          <button
            type="button"
            (click)="useMyLocation.emit()"
            title="Use Current Geolocation"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111115] hover:bg-zinc-800/90 border border-[#27272A] hover:border-cyan-500/40 text-xs font-medium text-zinc-200 transition-all active:scale-95"
          >
            <svg class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2m0 16v2M2 12h2m16 0h2m-10-5a5 5 0 100 10 5 5 0 000-10z" />
            </svg>
            <span class="hidden sm:inline">My Location</span>
          </button>

          <!-- Refresh Data -->
          <button
            type="button"
            (click)="refresh.emit()"
            [disabled]="loading"
            title="Refresh Weather Data"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111115] hover:bg-zinc-800/90 border border-[#27272A] hover:border-emerald-500/40 text-xs font-medium text-zinc-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <svg
              class="w-3.5 h-3.5 text-emerald-400"
              [class.animate-spin]="loading"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden sm:inline">Refresh</span>
          </button>

          <!-- Temp Unit Toggle -->
          <div class="inline-flex rounded-xl bg-[#111115] border border-[#27272A] p-0.5 font-mono-tabular text-xs">
            <button
              type="button"
              (click)="tempUnitChange.emit('C')"
              [class]="tempUnit === 'C' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'"
              class="px-2.5 py-1.5 rounded-lg font-semibold transition-all"
            >
              °C
            </button>
            <button
              type="button"
              (click)="tempUnitChange.emit('F')"
              [class]="tempUnit === 'F' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'"
              class="px-2.5 py-1.5 rounded-lg font-semibold transition-all"
            >
              °F
            </button>
          </div>

          <!-- Wind Unit Toggle -->
          <div class="inline-flex rounded-xl bg-[#111115] border border-[#27272A] p-0.5 font-mono-tabular text-xs">
            <button
              type="button"
              (click)="windUnitChange.emit('kmh')"
              [class]="windUnit === 'kmh' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'"
              class="px-2.5 py-1.5 rounded-lg font-semibold transition-all"
            >
              km/h
            </button>
            <button
              type="button"
              (click)="windUnitChange.emit('mph')"
              [class]="windUnit === 'mph' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'"
              class="px-2.5 py-1.5 rounded-lg font-semibold transition-all"
            >
              mph
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Pinned Locations Bar -->
      <div class="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#1F1F24]">
        <span class="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold shrink-0 mr-1">Pinned</span>
        <button
          *ngFor="let city of pinnedCities"
          type="button"
          (click)="selectCity.emit(city)"
          [class]="isSelected(city)
            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/50'
            : 'bg-[#111115] text-zinc-400 hover:text-zinc-100 border-[#27272A] hover:border-zinc-600'"
          class="px-3 py-1.5 rounded-lg border text-xs font-medium shrink-0 transition-all"
        >
          {{ city.name }}
        </button>

        <button
          *ngIf="activeLocation"
          type="button"
          (click)="togglePin.emit(activeLocation)"
          class="ml-auto px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#111115] hover:border-amber-500/40 text-xs font-medium text-amber-300 shrink-0 transition-all"
        >
          {{ isPinned(activeLocation) ? '★ Unpin' : '+ Pin ' + activeLocation.name }}
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private weatherService = inject(WeatherService);

  @Input() activeLocation: CityLocation | null = null;
  @Input() pinnedCities: CityLocation[] = [];
  @Input() tempUnit: TempUnit = 'C';
  @Input() windUnit: WindUnit = 'kmh';
  @Input() loading = false;

  @Output() selectCity = new EventEmitter<CityLocation>();
  @Output() togglePin = new EventEmitter<CityLocation>();
  @Output() tempUnitChange = new EventEmitter<TempUnit>();
  @Output() windUnitChange = new EventEmitter<WindUnit>();
  @Output() useMyLocation = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  searchQuery = '';
  searchResults: CityLocation[] = [];
  showDropdown = false;
  private searchTimer: any;

  onSearchInput(): void {
    clearTimeout(this.searchTimer);
    const q = this.searchQuery.trim();
    if (q.length < 2) {
      this.searchResults = [];
      this.showDropdown = false;
      return;
    }
    this.searchTimer = setTimeout(() => {
      this.weatherService.searchCities(q).subscribe((results) => {
        this.searchResults = results;
        this.showDropdown = results.length > 0;
      });
    }, 300);
  }

  selectSearchResult(city: CityLocation): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showDropdown = false;
    this.selectCity.emit(city);
  }

  isSelected(city: CityLocation): boolean {
    if (!this.activeLocation) return false;
    return (
      Math.abs(city.latitude - this.activeLocation.latitude) < 0.05 &&
      Math.abs(city.longitude - this.activeLocation.longitude) < 0.05
    );
  }

  isPinned(city: CityLocation): boolean {
    return this.pinnedCities.some(
      (c) => Math.abs(c.latitude - city.latitude) < 0.05 && Math.abs(c.longitude - city.longitude) < 0.05
    );
  }
}
