# Dynamic Portfolio Dashboard

An institutional-grade, full-stack Portfolio Dashboard web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Node.js**, developed for the **Octa Byte AI Pvt Ltd** case study.

The dashboard tracks equity portfolio performance in real-time, pulling live quotes from **Yahoo Finance** and key fundamental metrics (P/E Ratio and latest earnings) from **Google Finance**, with sector-level aggregation, interactive charts, and dynamic periodic updates.

---

## Key Features

- **Live Market Data Integration**:
  - **Yahoo Finance**: Fetches real-time Current Market Price (CMP), previous day close, and daily price movement.
  - **Google Finance**: Scrapes and extracts P/E Ratio (TTM) and latest earnings per share (EPS).
- **Dynamic 15-Second Refresh**:
  - Automated polling updates CMP, Present Value, and Gain/Loss every 15 seconds.
  - Visual pulse flash indicators (`flash-up` in emerald green when prices rise, `flash-down` in ruby crimson when prices drop).
  - Countdown timer and manual on-demand sync button.
- **Sector Grouping & Aggregations**:
  - Group holdings by industry sectors (Financial Sector, Tech Sector, Consumer, Power, Pipe Sector, Others).
  - Calculates sector-level subtotals: Total Investment, Total Present Value, and Gain/Loss (amount & %).
  - Expandable/collapsible sector accordion rows.
- **Visual Performance Indicators**:
  - Color-coded Gain/Loss metrics: vibrant emerald green for gains, crimson red for losses.
  - Interactive SVG sparklines and live tick direction.
- **Institutional Visualizations (Recharts)**:
  - **Alpha Generation Curve**: Mark-to-Market equity vs NIFTY 50 TRI benchmark with 1M, 6M, 1Y, 3Y, ALL filters.
  - **Market Cap Distribution**: Donut breakdown (Large Cap, Mid Cap, Small Cap).
  - **Sector Allocation Matrix**: Visual radial weight breakdown.
  - **Capital Spread**: Cost Basis vs Current Value grouped bar chart.
- **Dual View Layout**:
  - Detailed Data Grid view (TanStack Table) with sorting, search filtering, and CSV export.
  - Treemap Heatmap Grid view for quick portfolio performance overview.
- **Simulated Order Execution Ticket**:
  - Buy/Sell/Trim modal popup with live outlay calculator and toast alerts.
- **Resilient Multi-Tier API Architecture**:
  - In-memory caching with TTL to prevent upstream IP rate-limiting (HTTP 429).
  - Graceful fallback to verified Excel dataset fundamentals if external scraping is throttled.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 (Obsidian Dark Institutional Theme) |
| **Table Engine** | `@tanstack/react-table` |
| **Charts** | `recharts` |
| **Data Scraping & Fetching** | `axios`, `cheerio`, `yahoo-finance2` |
| **Icons & Typography** | `lucide-react`, Inter, JetBrains Mono, Plus Jakarta Sans |

---

## Getting Started

### Prerequisites
- **Node.js**: v20.x or newer
- **npm**: v10.x or newer

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd stock_folio
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default configuration in `.env`:
```env
PORT=3000
NODE_ENV=development

# Refresh interval (15000 ms = 15 seconds)
NEXT_PUBLIC_REFRESH_INTERVAL_MS=15000

# Cache duration in seconds
CACHE_TTL_SECONDS=30

# External API timeouts
YAHOO_FINANCE_TIMEOUT_MS=6000
GOOGLE_FINANCE_TIMEOUT_MS=6000
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## API Reference

### `GET /api/portfolio`
Returns real-time portfolio holdings, sector aggregations, and executive summaries.

**Sample Response**:
```json
{
  "success": true,
  "timestamp": "2026-09-10T09:47:28.038Z",
  "isMarketOpen": true,
  "summary": {
    "totalInvestment": 1543060,
    "totalPresentValue": 2045120.5,
    "netGainLoss": 502060.5,
    "netGainLossPercent": 32.54,
    "dayGainLoss": 14280.0,
    "dayGainLossPercent": 0.70,
    "stockCount": 26,
    "topPerformer": { ... },
    "laggingPerformer": { ... },
    "highestValuation": { ... },
    "largestHolding": { ... }
  },
  "sectors": [
    {
      "sector": "Financial Sector",
      "stockCount": 5,
      "totalInvestment": 328450,
      "totalPresentValue": 412500,
      "gainLoss": 84050,
      "gainLossPercent": 25.59,
      "portfolioWeight": 21.28,
      "stocks": [ ... ]
    }
  ],
  "holdings": [ ... ]
}
```

---

## Project Structure
```
stock_folio/
├── app/
│   ├── api/
│   │   └── portfolio/
│   │       └── route.ts          # Consolidated portfolio live data API
│   ├── globals.css               # Obsidian design tokens & tick keyframes
│   ├── layout.tsx                # Typography & root HTML wrapper
│   └── page.tsx                  # Interactive client dashboard
├── components/
│   ├── AlphaInsights.tsx         # Key outlier metrics (top/lagging performers, valuation)
│   ├── ExecutiveSummary.tsx      # Portfolio overview metrics (Invested, Value, P&L, Day change)
│   ├── Header.tsx                # Market hours, countdown timer, sync trigger
│   ├── OrderModal.tsx            # Buy/Sell simulated execution ticket
│   ├── PortfolioCharts.tsx       # Recharts (Alpha curve, Cap size, Sector spread)
│   ├── PortfolioTable.tsx        # TanStack Table with sector grouping & CSV export
│   ├── SectorCards.tsx           # Sector performance summary cards
│   ├── Sidebar.tsx               # Navigation & live index feed
│   └── Toast.tsx                 # Non-intrusive alert toasts
├── data/
│   └── initialHoldings.ts        # Pre-loaded Excel portfolio dataset (26+ stocks)
├── lib/
│   ├── services/
│   │   ├── cacheService.ts       # In-memory TTL caching & stale fallback
│   │   ├── googleFinance.ts      # Cheerio scraper for P/E & earnings
│   │   └── yahooFinance.ts       # Multi-tier Yahoo quote fetcher
│   └── utils.ts                  # Indian number system currency formatters
├── types/
│   └── portfolio.ts              # Comprehensive TypeScript interfaces
├── .env.example                  # Deployment environment template
├── TECHNICAL_DOCUMENT.md         # Architecture, scraping, and challenges write-up
└── README.md
```
