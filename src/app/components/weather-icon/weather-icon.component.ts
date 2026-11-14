import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngSwitch]="category" [style.width.px]="size" [style.height.px]="size" class="inline-flex items-center justify-center shrink-0">
      <!-- Clear Day -->
      <svg *ngSwitchCase="'clear-day'" viewBox="0 0 64 64" class="w-full h-full">
        <circle cx="32" cy="32" r="14" fill="#FBBF24" />
        <g stroke="#FBBF24" stroke-width="3.5" stroke-linecap="round">
          <line x1="32" y1="6" x2="32" y2="12" />
          <line x1="32" y1="52" x2="32" y2="58" />
          <line x1="6" y1="32" x2="12" y2="32" />
          <line x1="52" y1="32" x2="58" y2="32" />
          <line x1="13.6" y1="13.6" x2="17.9" y2="17.9" />
          <line x1="46.1" y1="46.1" x2="50.4" y2="50.4" />
          <line x1="50.4" y1="13.6" x2="46.1" y2="17.9" />
          <line x1="17.9" y1="46.1" x2="13.6" y2="50.4" />
        </g>
      </svg>

      <!-- Clear Night -->
      <svg *ngSwitchCase="'clear-night'" viewBox="0 0 64 64" class="w-full h-full">
        <path d="M41.5 13.5A18 18 0 1 0 50.5 42.5A15 15 0 0 1 41.5 13.5Z" fill="#38BDF8" />
        <circle cx="48" cy="18" r="2" fill="#BAE6FD" />
        <circle cx="53" cy="27" r="1.5" fill="#7DD3FC" />
      </svg>

      <!-- Partly Cloudy -->
      <svg *ngSwitchCase="'partly-cloudy'" viewBox="0 0 64 64" class="w-full h-full">
        <circle cx="24" cy="24" r="10" fill="#FBBF24" />
        <path d="M22 46h24a10 10 0 0 0 1.4-19.9A13 13 0 0 0 22.5 23a11 11 0 0 0-.5 23Z" fill="#E4E4E7" />
      </svg>

      <!-- Cloudy / Overcast / Fog -->
      <svg *ngSwitchCase="'cloudy'" viewBox="0 0 64 64" class="w-full h-full">
        <path d="M18 46h28a11 11 0 0 0 1.5-21.9A14 14 0 0 0 20.5 21a12 12 0 0 0-2.5 25Z" fill="#A1A1AA" />
      </svg>

      <!-- Rain / Drizzle -->
      <svg *ngSwitchCase="'rain'" viewBox="0 0 64 64" class="w-full h-full">
        <path d="M18 40h28a10 10 0 0 0 1.4-19.9A13 13 0 0 0 21.5 17a11 11 0 0 0-3.5 23Z" fill="#71717A" />
        <g stroke="#22D3EE" stroke-width="3" stroke-linecap="round">
          <line x1="23" y1="46" x2="20" y2="54" />
          <line x1="33" y1="46" x2="30" y2="54" />
          <line x1="43" y1="46" x2="40" y2="54" />
        </g>
      </svg>

      <!-- Snow -->
      <svg *ngSwitchCase="'snow'" viewBox="0 0 64 64" class="w-full h-full">
        <path d="M18 40h28a10 10 0 0 0 1.4-19.9A13 13 0 0 0 21.5 17a11 11 0 0 0-3.5 23Z" fill="#D4D4D8" />
        <g fill="#67E8F9">
          <circle cx="23" cy="49" r="2.5" />
          <circle cx="33" cy="53" r="2.5" />
          <circle cx="43" cy="49" r="2.5" />
        </g>
      </svg>

      <!-- Thunderstorm -->
      <svg *ngSwitchDefault viewBox="0 0 64 64" class="w-full h-full">
        <path d="M18 39h28a10 10 0 0 0 1.4-19.9A13 13 0 0 0 21.5 16a11 11 0 0 0-3.5 23Z" fill="#52525B" />
        <polygon points="34,37 25,49 32,49 29,59 41,45 34,45" fill="#FACC15" />
      </svg>
    </div>
  `
})
export class WeatherIconComponent {
  @Input() code = 0;
  @Input() isDay = true;
  @Input() size = 36;

  get category(): string {
    if (this.code === 0 || this.code === 1) {
      return this.isDay ? 'clear-day' : 'clear-night';
    }
    if (this.code === 2) return 'partly-cloudy';
    if (this.code === 3 || this.code === 45 || this.code === 48) return 'cloudy';
    if ((this.code >= 51 && this.code <= 67) || (this.code >= 80 && this.code <= 82)) return 'rain';
    if ((this.code >= 71 && this.code <= 77) || this.code === 85 || this.code === 86) return 'snow';
    return 'storm';
  }
}
