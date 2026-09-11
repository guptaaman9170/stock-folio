# Technical Document: Dynamic Portfolio Dashboard

**Company Case Study**: Octa Byte AI Pvt Ltd  
**Project**: Dynamic Portfolio Dashboard with React.js, TypeScript, Tailwind CSS & Node.js  
**Author**: Aman Gupta  

---

## 1. Executive Summary

This document details the architectural decisions, technical challenges, and problem-solving methodologies implemented while building the real-time institutional portfolio dashboard. The application consumes live market feeds from unofficial sources (Yahoo Finance and Google Finance), handles parallel asynchronous operations, prevents rate limiting through multi-tiered caching, and provides interactive sector grouping with real-time price updates.

---

## 2. API Strategy & External Data Sources

### Challenge 1: Unofficial APIs & Scraping Volatility
Neither Yahoo Finance nor Google Finance provides free, public, officially supported REST APIs for individual developers:
- **Yahoo Finance**: Frequently changes endpoint headers, cookies, and crumb tokens.
- **Google Finance**: Serves heavily obfuscated server-rendered HTML with dynamic CSS class names and strict anti-scraping bot challenges.

### Solution: Multi-Tiered Resilient Architecture
Rather than relying on a single scraping vector, the backend services implement a 4-tier fallback pipeline:

```
[Request Ticker Data]
        │
        ▼
  [Tier 0: In-Memory TTL Cache] ──(Hit)──► Return Cached Data (<1ms)
        │ (Miss/Expired)
        ▼
  [Tier 1: Library Query (yahoo-finance2)] ──(Success)──► Update Cache & Return
        │ (Fails / Times out)
        ▼
  [Tier 2: Direct REST Quote API (Yahoo Chart v8)] ──(Success)──► Update Cache & Return
        │ (Fails / Blocked)
        ▼
  [Tier 3: Google Finance HTML Parsing via Cheerio]
        │ (Extracts P/E ratio and EPS from DOM)
        ▼
  [Tier 4: Stale-While-Revalidate / Excel Baseline Dataset]
        └── Guarantees 100% application uptime with zero crashes
```

1. **Yahoo Finance (`lib/services/yahooFinance.ts`)**:
   - First attempts the `yahoo-finance2` library with a strict 5000ms timeout using `Promise.race`.
   - On error or timeout, falls back to direct HTTP queries to `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=1d` with standard browser `User-Agent` headers.
   - Accurately maps Indian exchange tickers (e.g., `HDFCBANK` to `HDFCBANK.NS` for NSE and `511577` to `511577.BO` for BSE).

2. **Google Finance (`lib/services/googleFinance.ts`)**:
   - Queries `https://www.google.com/finance/quote/{symbol}:{exchange}`.
   - Uses `cheerio` to parse structured class markers (`.gyFHrc`, `.P6K39c`, `.mfs7Fc`) to extract P/E Ratio (TTM) and latest earnings.
   - Cleans raw strings (e.g., stripping commas, extracting numerical values, and handling negative numbers).

---

## 3. Rate Limiting & Performance Optimization

### Challenge 2: Upstream Rate Limiting (HTTP 429) & Performance Bottlenecks
Polling 26+ individual stocks every 15 seconds against external financial providers would trigger IP rate limits within minutes and cause heavy browser re-rendering.

### Solution: Caching, Request Batching & Memoization
1. **Server-Side In-Memory Cache (`lib/services/cacheService.ts`)**:
   - Implements a TTL-based cache (`CACHE_TTL_SECONDS=30` configurable via `.env`).
   - Differential TTLs: Live stock prices fluctuate and use a 30s TTL, while quarterly fundamentals (P/E ratio and EPS) change infrequently and are cached with extended validity.
   - Stale-While-Revalidate: If upstream queries time out or encounter a network glitch, the system serves the last-known good cached quote instead of throwing an error.

2. **Concurrent Asynchronous Operations (`Promise.allSettled`)**:
   - Instead of sequential `for` loops which would take 26 × 5s = 130 seconds, all 26 stocks are fetched in parallel using `Promise.allSettled()`.
   - The entire batch resolves within 2 to 4 seconds.
   - Individual stock failures are isolated; a timeout on stock #5 does not abort or corrupt stocks #1 through #4 or #6 through #26.

3. **Client-Side Rendering Optimization**:
   - `useMemo` is applied to filtering, sorting, and sector grouping to prevent unnecessary recalculations during non-table state changes.
   - Atomic CSS keyframe animations (`flash-up` / `flash-down`) are triggered only on cells whose values changed since the previous tick.

---

## 4. Sector Grouping & Data Transformation

### Challenge 3: Hierarchical Summaries & Mathematical Consistency
The application displays both individual stock lines and aggregated sector-level summaries:
- Total Sector Investment
- Total Sector Present Value
- Sector Gain/Loss & Percentage
- Sector Portfolio Weight

### Solution: Dynamic Multi-Level Aggregation Pipeline
In `app/api/portfolio/route.ts`:
1. Individual stock metrics are computed:
   $$\text{Investment} = \text{Purchase Price} \times \text{Quantity}$$
   $$\text{Present Value} = \text{CMP} \times \text{Quantity}$$
   $$\text{Gain/Loss} = \text{Present Value} - \text{Investment}$$
   $$\text{Gain/Loss \%} = \frac{\text{Gain/Loss}}{\text{Investment}} \times 100$$
2. A `Map<SectorType, StockHolding[]>` groups stocks into:
   - Financial Sector
   - Tech Sector
   - Consumer
   - Power
   - Pipe Sector
   - Others
3. Sector-level totals are reduced and validated against the entire portfolio total to ensure $\sum \text{Sector Weights} = 100\%$.
4. The frontend UI provides an interactive accordion allowing users to toggle between **Sector Grouped Mode** (with collapsible headers and subtotal rows) and **Flat Table Mode**.

---

## 5. User Interface & Visual Design

### Design Implementation
- Built using an institutional dark palette (`#0f131c` background, `#1c2028` surface cards, emerald green profit indicators `#4edea3`, crimson red loss indicators `#ff5449`, and cyan accents `#4cd7f6`).
- Native Indian Currency formatting (`formatINR`) implementing the lakh/crore grouping standard (`₹12,34,567.00`).
- Interactive Features:
  - **Live Tick Flashes**: Highlighting real-time market movements.
  - **Alpha Curve Chart**: Comparing portfolio equity vs NIFTY 50 TRI benchmark with timeframe toggles.
  - **Heatmap Treemap Grid**: Toggle between tabular data and visual performance tiles.
  - **Simulated Order Modal**: Interactive Buy/Sell ticket with real-time outlay calculation.
  - **Instant CSV Export**: Generates compliant portfolio disclosures directly in the browser.

---

## 6. Deployment & Environment Readiness

- Full `.env` and `.env.example` configurations.
- Compatible with Vercel, Netlify, and Docker Node.js runtimes.
- Zero client-side API key exposure; all scraping and API calls are isolated in Next.js server-side routes (`/api/portfolio`).
- Configured with `maxDuration = 30` to prevent serverless function timeouts on cloud providers.

---

## 7. Key Architectural Decisions & Engineering Rationale

### 7.1 Dual Financial Data Ingestion Strategy
Yahoo Finance and Google Finance serve complementary roles in this architecture:
- **Yahoo Finance** provides real-time equity quotes (CMP), intraday volume, and previous close prices.
- **Google Finance** provides key company valuation metrics: Price-to-Earnings (P/E) ratio and trailing Earnings Per Share (EPS).

Because public, official REST APIs are not offered for either endpoint, requests are executed on the Node.js backend using `Promise.allSettled()` to query both providers concurrently while strictly isolating any provider failure.

### 7.2 Rate Limiting (HTTP 429) Mitigation
Polling 26 equities every 15 seconds could quickly exhaust public rate limits without proper safeguards:
1. **Differential TTL In-Memory Caching (`cacheService.ts`)**: Real-time quotes use a 30-second cache window, while fundamental valuation multiples (which update quarterly) use longer TTLs to eliminate redundant scraping.
2. **Stale-While-Revalidate Fallbacks**: In the event of a temporary upstream network timeout or throttling, the backend immediately returns the last known good cached state, guaranteeing consistent uptime.

### 7.3 Concurrency & Asynchronous Event Loop Optimization
Rather than serial sequential iteration (which would accumulate over 100 seconds of round-trip latency across 26 symbols), all external requests are dispatched in parallel via `Promise.allSettled()`. This reduces overall batch latency to the duration of the slowest single request (~2–4 seconds) while preventing one symbol's failure from blocking others.

### 7.4 Client-Side Re-render Optimization
With automated 15-second polling cycles, maintaining smooth 60fps UI performance is achieved through:
1. **`React.memo`** on table row components to restrict DOM re-renders exclusively to rows whose price deltas actually changed.
2. **`useMemo`** for sector grouping aggregations and multi-criteria sorting/filtering.
3. **Targeted CSS keyframe transitions** (`flash-up` / `flash-down`) applied directly to updated cells rather than triggering a re-render of the entire table tree.

