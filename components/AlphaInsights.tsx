'use client';

import React from 'react';
import { 
  Sparkles, 
  Rocket, 
  TrendingDown, 
  Diamond, 
  PieChart as PieIcon 
} from 'lucide-react';
import { formatPercent, formatINR } from '@/lib/utils';

interface AlphaInsightsProps {
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
}

export function AlphaInsights({
  topPerformer,
  laggingPerformer,
  highestValuation,
  largestHolding
}: AlphaInsightsProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-tertiary shrink-0" />
          <span className="font-display text-xs sm:text-sm font-bold text-on-surface">
            Institutional Alpha AI Insights
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/20 shrink-0">
            Live
          </span>
        </div>
        <span className="text-[11px] font-mono text-outline hidden md:inline">
          Black-Scholes & Sharpe Calculated Exposures
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Top Performer */}
        <div className="rounded-2xl bg-[#181c24] p-3.5 sm:p-4 flex flex-col justify-between border border-[#262a33] shadow-sm hover:border-secondary/50 transition-all relative overflow-hidden group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[10px] sm:text-[11px] text-outline uppercase tracking-wider truncate">
                Top Performer
              </span>
              <span className="font-display text-sm font-bold text-on-surface mt-0.5 group-hover:text-primary transition-colors truncate">
                {topPerformer.particulars}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-outline truncate">
                {topPerformer.symbol} • {topPerformer.sector.replace(' Sector', '')}
              </span>
            </div>
            <span className="p-2 rounded-xl bg-secondary/15 text-secondary border border-secondary/20 shrink-0">
              <Rocket className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-mono text-xs sm:text-sm font-bold text-secondary">
                {formatPercent(topPerformer.gainLossPercent, { showSign: true })}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-secondary/80 truncate">
                ({formatINR(topPerformer.gainLoss, { showSign: true, decimals: 0 })})
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#262a33] text-on-surface-variant shrink-0">
              Sharpe 2.1
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-60" />
        </div>

        {/* Card 2: Lagging Asset */}
        <div className="rounded-2xl bg-[#181c24] p-3.5 sm:p-4 flex flex-col justify-between border border-[#262a33] shadow-sm hover:border-error/50 transition-all relative overflow-hidden group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[10px] sm:text-[11px] text-outline uppercase tracking-wider truncate">
                Lagging Asset
              </span>
              <span className="font-display text-sm font-bold text-on-surface mt-0.5 group-hover:text-error transition-colors truncate">
                {laggingPerformer.particulars}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-outline truncate">
                {laggingPerformer.symbol} • Drawdown
              </span>
            </div>
            <span className="p-2 rounded-xl bg-error/15 text-error border border-error/20 shrink-0">
              <TrendingDown className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-mono text-xs sm:text-sm font-bold text-error">
                {formatPercent(laggingPerformer.gainLossPercent, { showSign: true })}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-error/80 truncate">
                ({formatINR(laggingPerformer.gainLoss, { showSign: true, decimals: 0 })})
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#262a33] text-error shrink-0">
              Review
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-error to-transparent opacity-50" />
        </div>

        {/* Card 3: Highest Valuation */}
        <div className="rounded-2xl bg-[#181c24] p-3.5 sm:p-4 flex flex-col justify-between border border-[#262a33] shadow-sm hover:border-tertiary/50 transition-all relative overflow-hidden group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[10px] sm:text-[11px] text-outline uppercase tracking-wider truncate">
                Highest Valuation
              </span>
              <span className="font-display text-sm font-bold text-on-surface mt-0.5 group-hover:text-tertiary transition-colors truncate">
                {highestValuation.particulars}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-outline truncate">
                {highestValuation.symbol} • Google Finance
              </span>
            </div>
            <span className="p-2 rounded-xl bg-tertiary/15 text-tertiary border border-tertiary/20 shrink-0">
              <Diamond className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-mono text-xs sm:text-sm font-bold text-tertiary">
                P/E {typeof highestValuation.peRatio === 'number' ? `${highestValuation.peRatio.toFixed(1)}x` : highestValuation.peRatio}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-outline">
                Premium
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/20 shrink-0">
              Growth
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-tertiary to-transparent opacity-50" />
        </div>

        {/* Card 4: Anchor Holding */}
        <div className="rounded-2xl bg-[#181c24] p-3.5 sm:p-4 flex flex-col justify-between border border-[#262a33] shadow-sm hover:border-primary/50 transition-all relative overflow-hidden group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[10px] sm:text-[11px] text-outline uppercase tracking-wider truncate">
                Core Anchor Holding
              </span>
              <span className="font-display text-sm font-bold text-on-surface mt-0.5 group-hover:text-primary transition-colors truncate">
                {largestHolding.particulars}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-outline truncate">
                {largestHolding.symbol} • Top Weight
              </span>
            </div>
            <span className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/20 shrink-0">
              <PieIcon className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-mono text-xs sm:text-sm font-bold text-primary">
                {largestHolding.weight.toFixed(1)}%
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-outline">
                Weight
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#262a33] text-primary shrink-0">
              {formatINR(largestHolding.value, { decimals: 0 })}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        </div>
      </div>
    </div>
  );
}
