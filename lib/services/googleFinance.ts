import axios from 'axios';
import * as cheerio from 'cheerio';
import { appCache } from './cacheService';

export interface GoogleFinanceResult {
  symbol: string;
  peRatio: number | string;
  latestEarnings: number | string;
  source: 'live' | 'cached' | 'fallback';
}

export async function fetchGoogleFinanceData(
  googleTicker: string,
  fallbackPE?: number,
  fallbackEarnings?: number
): Promise<GoogleFinanceResult> {
  const cacheKey = `google_${googleTicker}`;
  // P/E and earnings don't change by the second, cache for longer TTL
  const cached = appCache.get<GoogleFinanceResult>(cacheKey);
  if (cached) {
    return { ...cached, source: 'cached' };
  }

  const timeoutMs = parseInt(process.env.GOOGLE_FINANCE_TIMEOUT_MS || '6000', 10);
  const url = `https://www.google.com/finance/quote/${encodeURIComponent(googleTicker)}`;

  try {
    const response = await axios.get(url, {
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(response.data);
    let extractedPE: number | string | null = null;
    let extractedEarnings: number | string | null = null;

    // Google Finance displays key stats in items with class gyFHrc
    $('.gyFHrc').each((_, element) => {
      const label = $(element).find('.mfs7Fc').text().trim();
      const value = $(element).find('.P6K39c').text().trim();

      if (/P\/E ratio/i.test(label) || /Price to earnings/i.test(label)) {
        const num = parseFloat(value.replace(/,/g, ''));
        if (!isNaN(num)) {
          extractedPE = num;
        } else if (value) {
          extractedPE = value;
        }
      }

      if (/EPS/i.test(label) || /Earnings per share/i.test(label) || /Latest earnings/i.test(label)) {
        const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num)) {
          extractedEarnings = num;
        } else if (value) {
          extractedEarnings = value;
        }
      }
    });

    // Fallback search across any text block
    if (extractedPE === null) {
      $('div').each((_, el) => {
        const text = $(el).text();
        if (text.includes('P/E ratio') && !extractedPE) {
          const match = text.match(/P\/E ratio\s*([0-9.]+)/i);
          if (match && match[1]) {
            extractedPE = parseFloat(match[1]);
          }
        }
      });
    }

    const finalPE = extractedPE ?? fallbackPE ?? 'N/A';
    const finalEarnings = extractedEarnings ?? fallbackEarnings ?? 'N/A';

    const result: GoogleFinanceResult = {
      symbol: googleTicker,
      peRatio: finalPE,
      latestEarnings: finalEarnings,
      source: 'live'
    };

    // Cache fundamentals
    appCache.set(cacheKey, result);
    return result;
  } catch (err: unknown) {
    // Check stale cache
    const stale = appCache.getStale<GoogleFinanceResult>(cacheKey);
    if (stale) {
      return { ...stale, source: 'cached' };
    }

    // Return fallback from excel dataset
    return {
      symbol: googleTicker,
      peRatio: fallbackPE ?? 'N/A',
      latestEarnings: fallbackEarnings ?? 'N/A',
      source: 'fallback'
    };
  }
}
