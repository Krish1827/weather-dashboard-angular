# Weather — Obsidian Angular Dashboard

A pitch-black Bento-grid weather telemetry dashboard built with **Angular 19**, **Tailwind CSS**, and the **Open-Meteo API** (zero API keys required).

## Features
- **Pitch-Black Obsidian Bento UI**: `#000000` canvas, `#0A0A0C` / `#111115` cards, `1px` crisp borders, and high-contrast typography (`Space Grotesk`, `Plus Jakarta Sans`, `JetBrains Mono`).
- **Interactive Command Header**: City autocomplete search via Open-Meteo Geocoding, **Use My Location** geolocation, **Refresh Data**, **°C / °F** & **km/h / mph** toggles, and customizable **Pinned Locations** (`Brampton`, `Toronto`, `Calgary`, `Ahmedabad`, `Tokyo`, `New York`, `London`).
- **Interactive 24-Hour Telemetry Chart**: Clickable tabs for **Temperature**, **Precipitation %**, **Wind Speed**, and **UV Index** with interactive hover/click SVG nodes.
- **Atmospheric Telemetry Gauges**: Custom SVG wind direction compass, radial humidity arc gauge, UV exposure bar, barometric pressure, visibility, and cloud cover.
- **7-Day Interactive Forecast**: Click any day row to inspect sunrise/sunset, peak UV, precipitation sum, peak wind, and day/night temperatures.

## Quick Start
```bash
npm install
npm start
```
Open `http://localhost:4200` in your browser.
