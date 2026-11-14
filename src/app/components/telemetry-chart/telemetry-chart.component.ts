import { Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartMetric, HourlyPoint, TempUnit, WindUnit } from '../../models/weather.model';
import { WeatherService } from '../../services/weather.service';
import { WeatherIconComponent } from '../weather-icon/weather-icon.component';

interface ChartNode {
  x: number;
  y: number;
  value: number;
  displayValue: string;
  point: HourlyPoint;
}

@Component({
  selector: 'app-telemetry-chart',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  template: `
    <section class="bg-[#0A0A0C] border border-[#1F1F24] rounded-2xl p-6 h-full flex flex-col justify-between">
      <!-- Top Bar: Title & Metric Selector Tabs -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold text-white font-display">24-Hour Forecast</h3>
          <p class="text-xs text-zinc-400">Select a metric or click any time node to inspect</p>
        </div>

        <div class="inline-flex flex-wrap gap-1.5 bg-[#111115] p-1 rounded-xl border border-[#27272A]">
          <button
            *ngFor="let tab of metricTabs"
            type="button"
            (click)="setMetric(tab.key)"
            [class]="activeMetric === tab.key
              ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
            class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Selected Node Readout -->
      <div *ngIf="selectedNode" class="mb-4 flex items-center justify-between bg-[#111115] border border-[#27272A] rounded-xl px-4 py-2.5">
        <div class="flex items-center gap-3">
          <app-weather-icon
            [code]="selectedNode.point.weatherCode"
            [isDay]="selectedNode.point.isDay"
            [size]="28"
          />
          <div>
            <span class="text-xs font-mono-tabular text-zinc-400">{{ selectedNode.point.hourLabel }}</span>
            <span class="mx-2 text-zinc-600">•</span>
            <span class="text-xs text-zinc-300">{{ weatherService.getWeatherDescription(selectedNode.point.weatherCode) }}</span>
          </div>
        </div>
        <div class="text-base font-bold font-mono-tabular" [style.color]="accentColor">
          {{ selectedNode.displayValue }}
        </div>
      </div>

      <!-- Interactive SVG Line/Area Chart -->
      <div class="overflow-x-auto pb-2">
        <div class="min-w-[680px]">
          <svg viewBox="0 0 760 190" class="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [attr.stop-color]="accentColor" stop-opacity="0.32" />
                <stop offset="100%" [attr.stop-color]="accentColor" stop-opacity="0.0" />
              </linearGradient>
            </defs>

            <!-- Horizontal Grid Lines -->
            <line x1="20" y1="30" x2="740" y2="30" stroke="#1F1F24" stroke-dasharray="4 4" />
            <line x1="20" y1="85" x2="740" y2="85" stroke="#1F1F24" stroke-dasharray="4 4" />
            <line x1="20" y1="140" x2="740" y2="140" stroke="#1F1F24" stroke-dasharray="4 4" />

            <!-- Area Fill -->
            <path *ngIf="areaPath" [attr.d]="areaPath" fill="url(#chartAreaGrad)" />

            <!-- Line Path -->
            <path
              *ngIf="linePath"
              [attr.d]="linePath"
              fill="none"
              [attr.stroke]="accentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Interactive Data Nodes -->
            <g
              *ngFor="let node of nodes; let idx = index"
              (mouseenter)="selectedIndex = idx"
              (click)="selectedIndex = idx"
              class="cursor-pointer group"
            >
              <!-- Invisible wider hit target -->
              <rect [attr.x]="node.x - 14" y="10" width="28" height="165" fill="transparent" />

              <!-- Vertical guide line when selected -->
              <line
                *ngIf="selectedIndex === idx"
                [attr.x1]="node.x"
                y1="20"
                [attr.x2]="node.x"
                y2="145"
                [attr.stroke]="accentColor"
                stroke-opacity="0.4"
                stroke-width="1"
              />

              <!-- Point Circle -->
              <circle
                [attr.cx]="node.x"
                [attr.cy]="node.y"
                [attr.r]="selectedIndex === idx ? 5.5 : 3"
                [attr.fill]="selectedIndex === idx ? accentColor : '#0A0A0C'"
                [attr.stroke]="accentColor"
                stroke-width="2"
              />

              <!-- Value label every 3 hours or when selected -->
              <text
                *ngIf="idx % 3 === 0 || selectedIndex === idx"
                [attr.x]="node.x"
                [attr.y]="node.y - 11"
                text-anchor="middle"
                class="text-[10px] font-mono-tabular fill-zinc-200 font-semibold"
              >
                {{ node.displayValue }}
              </text>

              <!-- Hour Label -->
              <text
                *ngIf="idx % 3 === 0 || selectedIndex === idx"
                [attr.x]="node.x"
                y="168"
                text-anchor="middle"
                [class]="selectedIndex === idx ? 'fill-white font-bold' : 'fill-zinc-500'"
                class="text-[10px] font-mono-tabular"
              >
                {{ node.point.hourLabel }}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  `
})
export class TelemetryChartComponent implements OnChanges {
  weatherService = inject(WeatherService);

  @Input() hourly: HourlyPoint[] = [];
  @Input() tempUnit: TempUnit = 'C';
  @Input() windUnit: WindUnit = 'kmh';

  activeMetric: ChartMetric = 'temp';
  selectedIndex = 0;
  nodes: ChartNode[] = [];
  linePath = '';
  areaPath = '';

  readonly metricTabs: { key: ChartMetric; label: string }[] = [
    { key: 'temp', label: 'Temperature' },
    { key: 'precip', label: 'Precipitation %' },
    { key: 'wind', label: 'Wind Speed' },
    { key: 'uv', label: 'UV Index' }
  ];

  get accentColor(): string {
    switch (this.activeMetric) {
      case 'temp':
        return '#22D3EE'; // Cyan
      case 'precip':
        return '#38BDF8'; // Sky Blue
      case 'wind':
        return '#34D399'; // Emerald
      case 'uv':
        return '#FBBF24'; // Amber
    }
  }

  get selectedNode(): ChartNode | null {
    return this.nodes[this.selectedIndex] ?? null;
  }

  ngOnChanges(): void {
    this.buildChart();
  }

  setMetric(metric: ChartMetric): void {
    this.activeMetric = metric;
    this.buildChart();
  }

  private buildChart(): void {
    if (!this.hourly || this.hourly.length === 0) {
      this.nodes = [];
      this.linePath = '';
      this.areaPath = '';
      return;
    }

    const rawValues = this.hourly.map((pt) => {
      switch (this.activeMetric) {
        case 'temp':
          return this.weatherService.formatTemp(pt.tempC, this.tempUnit);
        case 'precip':
          return pt.precipProb;
        case 'wind':
          return this.weatherService.formatWind(pt.windKmh, this.windUnit);
        case 'uv':
          return Number(pt.uvIndex.toFixed(1));
      }
    });

    const minVal = Math.min(...rawValues);
    const maxVal = Math.max(...rawValues);
    const range = maxVal - minVal || 1;

    const startX = 28;
    const endX = 732;
    const topY = 34;
    const bottomY = 136;
    const stepX = (endX - startX) / Math.max(this.hourly.length - 1, 1);

    this.nodes = this.hourly.map((pt, i) => {
      const val = rawValues[i];
      const norm = (val - minVal) / range;
      const x = startX + i * stepX;
      const y = bottomY - norm * (bottomY - topY);

      let displayValue = '';
      if (this.activeMetric === 'temp') displayValue = `${val}°`;
      else if (this.activeMetric === 'precip') displayValue = `${val}%`;
      else if (this.activeMetric === 'wind') displayValue = `${val} ${this.windUnit}`;
      else displayValue = `UV ${val}`;

      return { x, y, value: val, displayValue, point: pt };
    });

    this.linePath = this.nodes
      .map((n, idx) => `${idx === 0 ? 'M' : 'L'} ${n.x.toFixed(1)} ${n.y.toFixed(1)}`)
      .join(' ');

    const first = this.nodes[0];
    const last = this.nodes[this.nodes.length - 1];
    this.areaPath = `${this.linePath} L ${last.x.toFixed(1)} 142 L ${first.x.toFixed(1)} 142 Z`;
  }
}
