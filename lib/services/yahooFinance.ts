import yahooFinance from 'yahoo-finance2';
import axios from 'axios';
import { appCache } from './cacheService';

export interface YahooQuoteResult {
  symbol: string;
  cmp: number;
  previousClose: number;
  dayChange: number;
  dayChangePercent: number;
  source: 'live' | 'cached' | 'fallback';
}

export async function fetchYahooQuote(ticker: string, fallbackCMP: number): Promise<YahooQuoteResult> {
  const cacheKey = `yahoo_${ticker}`;
  const cached = appCache.get<YahooQuoteResult>(cacheKey);
  if (cached) {
    return { ...cached, source: 'cached' };
  }

  const timeoutMs = parseInt(process.env.YAHOO_FINANCE_TIMEOUT_MS || '5000', 10);

  // Strategy 1: Attempt yahoo-finance2 library
  try {
    const quote: any = await Promise.race([
      yahooFinance.quote(ticker),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Yahoo Finance quote timeout')), timeoutMs)
      )
    ]);

    if (quote && typeof quote.regularMarketPrice === 'number') {
      const price = quote.regularMarketPrice;
      const prevClose = quote.regularMarketPreviousClose || price;
      const change = quote.regularMarketChange ?? (price - prevClose);
      const changePercent = quote.regularMarketChangePercent ?? (prevClose > 0 ? (change / prevClose) * 100 : 0);

      const result: YahooQuoteResult = {
        symbol: ticker,
        cmp: Number(price.toFixed(2)),
        previousClose: Number(prevClose.toFixed(2)),
        dayChange: Number(change.toFixed(2)),
        dayChangePercent: Number(changePercent.toFixed(2)),
        source: 'live'
      };

      appCache.set(cacheKey, result);
      return result;
    }
  } catch (err: unknown) {
    // Suppress verbose logging and proceed to Strategy 2
  }

  // Strategy 2: Direct REST query to Yahoo Finance v8 chart endpoint
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const response = await axios.get(url, {
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    const meta = response.data?.chart?.result?.[0]?.meta;
    if (meta && typeof meta.regularMarketPrice === 'number') {
      const price = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose || meta.previousClose || price;
      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

      const result: YahooQuoteResult = {
        symbol: ticker,
        cmp: Number(price.toFixed(2)),
        previousClose: Number(prevClose.toFixed(2)),
        dayChange: Number(change.toFixed(2)),
        dayChangePercent: Number(changePercent.toFixed(2)),
        source: 'live'
      };

      appCache.set(cacheKey, result);
      return result;
    }
  } catch (err: unknown) {
    // Proceed to stale or fallback
  }

  // Strategy 3: Check stale cache if available
  const stale = appCache.getStale<YahooQuoteResult>(cacheKey);
  if (stale) {
    return { ...stale, source: 'cached' };
  }

  // Strategy 4: Fallback baseline with historical price
  return {
    symbol: ticker,
    cmp: fallbackCMP,
    previousClose: fallbackCMP,
    dayChange: 0,
    dayChangePercent: 0,
    source: 'fallback'
  };
}
