export type SectorType = 
  | 'Financial Sector'
  | 'Tech Sector'
  | 'Consumer'
  | 'Power'
  | 'Pipe Sector'
  | 'Others';

export type CapTier = 'Large' | 'Mid' | 'Small';

export interface BaseHolding {
  id: string;
  particulars: string;
  shortCode: string;
  nseBseCode: string; // Display code in sheet, e.g. "HDFCBANK", "532174", "ASTRAL"
  yahooTicker: string; // Ticker for Yahoo Finance, e.g. "HDFCBANK.NS" or "532174.BO"
  googleTicker: string; // Ticker for Google Finance, e.g. "HDFCBANK:NSE" or "532174:BOM"
  sector: SectorType;
  capTier: CapTier;
  purchasePrice: number;
  qty: number;
  
  // Historical fundamentals from Excel (for fallbacks and advanced analytics)
  marketCap?: number;
  peRatioHistorical?: number;
  latestEarningsHistorical?: number;
  revenueTTM?: number;
  patTTM?: number;
  bookValue?: number;
}

export interface StockHolding extends BaseHolding {
  investment: number; // Purchase Price * Qty
  portfolioWeight: number; // (Investment / Total Investment) * 100
  cmp: number; // Current Market Price from Yahoo Finance
  previousClose?: number;
  dayChange?: number;
  dayChangePercent?: number;
  presentValue: number; // CMP * Qty
  gainLoss: number; // Present Value - Investment
  gainLossPercent: number; // (GainLoss / Investment) * 100
  peRatio: number | string; // from Google Finance
  latestEarnings: number | string; // from Google Finance
  
  // Real-time tick metadata
  lastUpdated: string;
  sourceYahoo: 'live' | 'cached' | 'fallback';
  sourceGoogle: 'live' | 'cached' | 'fallback';
  priceDirection?: 'up' | 'down' | 'neutral';
  error?: string;
}

export interface SectorSummary {
  sector: SectorType;
  stockCount: number;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  portfolioWeight: number;
  stocks: StockHolding[];
}

export interface PortfolioResponse {
  success: boolean;
  timestamp: string;
  isMarketOpen: boolean;
  summary: {
    totalInvestment: number;
    totalPresentValue: number;
    netGainLoss: number;
    netGainLossPercent: number;
    dayGainLoss: number;
    dayGainLossPercent: number;
    stockCount: number;
    topPerformer: {
      particulars: string;
      symbol: string;
      sector: string;
      gainLossPercent: number;
      gainLoss: number;
    };
    laggingPerformer: {
      particulars: string;
      symbol: string;
      sector: string;
      gainLossPercent: number;
      gainLoss: number;
    };
    highestValuation: {
      particulars: string;
      symbol: string;
      peRatio: number | string;
    };
    largestHolding: {
      particulars: string;
      symbol: string;
      weight: number;
      value: number;
    };
  };
  sectors: SectorSummary[];
  holdings: StockHolding[];
}
