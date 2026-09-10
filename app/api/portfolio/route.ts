import { NextResponse } from 'next/server';
import { INITIAL_HOLDINGS } from '@/data/initialHoldings';
import { fetchYahooQuote } from '@/lib/services/yahooFinance';
import { fetchGoogleFinanceData } from '@/lib/services/googleFinance';
import { StockHolding, SectorSummary, PortfolioResponse, SectorType } from '@/types/portfolio';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isIndianMarketOpen(): boolean {
  const now = new Date();
  // IST is UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);
  
  const day = istTime.getDay();
  // Saturday = 6, Sunday = 0
  if (day === 0 || day === 6) return false;

  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // 9:15 AM is 555 minutes, 3:30 PM is 930 minutes
  return currentMinutes >= 555 && currentMinutes <= 930;
}

export async function GET() {
  try {
    const totalCostBasis = INITIAL_HOLDINGS.reduce(
      (acc, h) => acc + h.purchasePrice * h.qty,
      0
    );

    // Fetch live data for all holdings in parallel
    const holdingsPromises = INITIAL_HOLDINGS.map(async (holding) => {
      const [yahooResult, googleResult] = await Promise.allSettled([
        fetchYahooQuote(holding.yahooTicker, holding.purchasePrice),
        fetchGoogleFinanceData(
          holding.googleTicker,
          holding.peRatioHistorical,
          holding.latestEarningsHistorical
        )
      ]);

      const yahoo = yahooResult.status === 'fulfilled' ? yahooResult.value : {
        symbol: holding.yahooTicker,
        cmp: holding.purchasePrice,
        previousClose: holding.purchasePrice,
        dayChange: 0,
        dayChangePercent: 0,
        source: 'fallback' as const
      };

      const google = googleResult.status === 'fulfilled' ? googleResult.value : {
        symbol: holding.googleTicker,
        peRatio: holding.peRatioHistorical ?? 'N/A',
        latestEarnings: holding.latestEarningsHistorical ?? 'N/A',
        source: 'fallback' as const
      };

      const investment = holding.purchasePrice * holding.qty;
      const presentValue = Number((yahoo.cmp * holding.qty).toFixed(2));
      const gainLoss = Number((presentValue - investment).toFixed(2));
      const gainLossPercent = Number(((gainLoss / investment) * 100).toFixed(2));
      const portfolioWeight = Number(((investment / totalCostBasis) * 100).toFixed(2));

      const stock: StockHolding = {
        ...holding,
        investment,
        portfolioWeight,
        cmp: yahoo.cmp,
        previousClose: yahoo.previousClose,
        dayChange: yahoo.dayChange,
        dayChangePercent: yahoo.dayChangePercent,
        presentValue,
        gainLoss,
        gainLossPercent,
        peRatio: google.peRatio,
        latestEarnings: google.latestEarnings,
        lastUpdated: new Date().toISOString(),
        sourceYahoo: yahoo.source,
        sourceGoogle: google.source,
        priceDirection: yahoo.dayChange > 0 ? 'up' : yahoo.dayChange < 0 ? 'down' : 'neutral'
      };

      return stock;
    });

    const holdings = await Promise.all(holdingsPromises);

    // Portfolio Totals
    const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
    const totalPresentValue = Number(holdings.reduce((sum, h) => sum + h.presentValue, 0).toFixed(2));
    const netGainLoss = Number((totalPresentValue - totalInvestment).toFixed(2));
    const netGainLossPercent = Number(((netGainLoss / totalInvestment) * 100).toFixed(2));

    const totalDayChange = Number(
      holdings.reduce((sum, h) => sum + ((h.dayChange || 0) * h.qty), 0).toFixed(2)
    );
    const dayGainLossPercent = Number(
      (totalPresentValue > 0 ? (totalDayChange / totalPresentValue) * 100 : 0).toFixed(2)
    );

    // Sector Grouping
    const sectorMap = new Map<SectorType, StockHolding[]>();
    for (const holding of holdings) {
      if (!sectorMap.has(holding.sector)) {
        sectorMap.set(holding.sector, []);
      }
      sectorMap.get(holding.sector)!.push(holding);
    }

    const sectors: SectorSummary[] = Array.from(sectorMap.entries()).map(([sector, stocks]) => {
      const sectorInvestment = stocks.reduce((sum, s) => sum + s.investment, 0);
      const sectorPresentValue = Number(stocks.reduce((sum, s) => sum + s.presentValue, 0).toFixed(2));
      const sectorGainLoss = Number((sectorPresentValue - sectorInvestment).toFixed(2));
      const sectorGainLossPercent = Number(((sectorGainLoss / sectorInvestment) * 100).toFixed(2));
      const sectorWeight = Number(((sectorInvestment / totalInvestment) * 100).toFixed(2));

      return {
        sector,
        stockCount: stocks.length,
        totalInvestment: sectorInvestment,
        totalPresentValue: sectorPresentValue,
        gainLoss: sectorGainLoss,
        gainLossPercent: sectorGainLossPercent,
        portfolioWeight: sectorWeight,
        stocks
      };
    });

    // Executive Insights Calculation
    const sortedByGain = [...holdings].sort((a, b) => b.gainLossPercent - a.gainLossPercent);
    const topPerformer = sortedByGain[0] || holdings[0];
    const laggingPerformer = sortedByGain[sortedByGain.length - 1] || holdings[0];

    const sortedByPE = [...holdings]
      .filter((h) => typeof h.peRatio === 'number')
      .sort((a, b) => (b.peRatio as number) - (a.peRatio as number));
    const highestValuation = sortedByPE[0] || holdings[0];

    const sortedByWeight = [...holdings].sort((a, b) => b.portfolioWeight - a.portfolioWeight);
    const largestHolding = sortedByWeight[0] || holdings[0];

    const responseData: PortfolioResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      isMarketOpen: isIndianMarketOpen(),
      summary: {
        totalInvestment,
        totalPresentValue,
        netGainLoss,
        netGainLossPercent,
        dayGainLoss: totalDayChange,
        dayGainLossPercent,
        stockCount: holdings.length,
        topPerformer: {
          particulars: topPerformer.particulars,
          symbol: topPerformer.nseBseCode,
          sector: topPerformer.sector,
          gainLossPercent: topPerformer.gainLossPercent,
          gainLoss: topPerformer.gainLoss
        },
        laggingPerformer: {
          particulars: laggingPerformer.particulars,
          symbol: laggingPerformer.nseBseCode,
          sector: laggingPerformer.sector,
          gainLossPercent: laggingPerformer.gainLossPercent,
          gainLoss: laggingPerformer.gainLoss
        },
        highestValuation: {
          particulars: highestValuation.particulars,
          symbol: highestValuation.nseBseCode,
          peRatio: highestValuation.peRatio
        },
        largestHolding: {
          particulars: largestHolding.particulars,
          symbol: largestHolding.nseBseCode,
          weight: largestHolding.portfolioWeight,
          value: largestHolding.presentValue
        }
      },
      sectors,
      holdings
    };

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
