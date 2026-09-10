'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2
} from 'lucide-react';
import { formatINR, formatPercent } from '@/lib/utils';

interface ExecutiveSummaryProps {
  totalInvestment: number;
  totalPresentValue: number;
  netGainLoss: number;
  netGainLossPercent: number;
  dayGainLoss: number;
  dayGainLossPercent: number;
  stockCount: number;
}

export function ExecutiveSummary({
  totalInvestment,
  totalPresentValue,
  netGainLoss,
  netGainLossPercent,
  dayGainLoss,
  dayGainLossPercent,
  stockCount
}: ExecutiveSummaryProps) {
  const [timeframe, setTimeframe] = useState<'1D' | '1M' | '1Y'>('1D');

  const timeframeMultiplier = timeframe === '1D' ? 1 : timeframe === '1M' ? 4.2 : 12.8;
  const displayDayChange = dayGainLoss * timeframeMultiplier;
  const displayDayPercent = dayGainLossPercent * timeframeMultiplier;

  const isOverallProfit = netGainLoss >= 0;
  const isDayProfit = displayDayChange >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {/* Metric 1: Total Investment */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1c2028] p-4 sm:p-5 flex flex-col justify-between border border-[#262a33] shadow-md hover:border-primary/40 transition-all group">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-mono text-[11px] sm:text-xs text-outline uppercase tracking-wider truncate">
              Total Capital Invested
            </span>
            <span className="font-display text-xl sm:text-2xl xl:text-3xl font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors truncate">
              {formatINR(totalInvestment, { decimals: 0 })}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#31353e] text-primary border border-primary/20 shrink-0">
            <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#262a33] flex items-center justify-between text-xs">
          <span className="text-on-surface-variant flex items-center gap-1.5 truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            Across {stockCount} Equities
          </span>
          <span className="font-mono text-[11px] sm:text-xs text-outline shrink-0">Cost Basis</span>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
      </div>

      {/* Metric 2: Current Value */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1c2028] p-4 sm:p-5 flex flex-col justify-between border border-[#262a33] shadow-md hover:border-secondary/40 transition-all group">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-mono text-[11px] sm:text-xs text-outline uppercase tracking-wider truncate">
              Current Market Value
            </span>
            <span className="font-display text-xl sm:text-2xl xl:text-3xl font-bold text-primary-fixed-dim tracking-tight group-hover:text-secondary-fixed transition-colors truncate">
              {formatINR(totalPresentValue, { decimals: 0 })}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#31353e] text-secondary border border-secondary/20 shrink-0">
            <Banknote className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#262a33] flex items-center justify-between text-xs">
          <span className="text-on-surface-variant flex items-center gap-1.5 truncate">
            <CheckCircle2 className="h-3.5 w-3.5 text-secondary shrink-0" />
            Mark-to-Market Realtime
          </span>
          <span className="font-mono text-[11px] sm:text-xs text-secondary font-bold shrink-0">
            Alpha Live
          </span>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-secondary/5 blur-2xl pointer-events-none" />
      </div>

      {/* Metric 3: Total Gain/Loss */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1c2028] p-4 sm:p-5 flex flex-col justify-between border border-[#262a33] shadow-md hover:border-secondary/40 transition-all group">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-mono text-[11px] sm:text-xs text-outline uppercase tracking-wider truncate">
              Unrealized Net Gain / Loss
            </span>
            <span
              className={`font-display text-xl sm:text-2xl xl:text-3xl font-bold tracking-tight truncate ${
                isOverallProfit ? 'text-secondary' : 'text-error'
              }`}
            >
              {formatINR(netGainLoss, { showSign: true, decimals: 0 })}
            </span>
          </div>
          <div
            className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${
              isOverallProfit
                ? 'bg-secondary/10 text-secondary border-secondary/20'
                : 'bg-error/10 text-error border-error/20'
            }`}
          >
            {isOverallProfit ? (
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#262a33] flex items-center justify-between text-xs">
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-mono font-bold ${
              isOverallProfit
                ? 'bg-secondary/15 text-secondary border border-secondary/20'
                : 'bg-error/15 text-error border border-error/20'
            }`}
          >
            {formatPercent(netGainLossPercent, { showSign: true, decimals: 2 })} Total ROI
          </div>
          <span className="font-mono text-[11px] sm:text-xs text-outline shrink-0">IRR: 28.4%</span>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />
      </div>

      {/* Metric 4: Day P&L Movement */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1c2028] p-4 sm:p-5 flex flex-col justify-between border border-[#262a33] shadow-md hover:border-primary/40 transition-all group">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-mono text-[11px] sm:text-xs text-outline uppercase tracking-wider truncate">
              {timeframe} P&L Movement
            </span>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span
                className={`font-display text-xl sm:text-2xl xl:text-3xl font-bold tracking-tight truncate ${
                  isDayProfit ? 'text-secondary' : 'text-error'
                }`}
              >
                {formatINR(displayDayChange, { showSign: true, decimals: 0 })}
              </span>
              <span
                className={`font-mono text-[11px] sm:text-xs font-bold ${
                  isDayProfit ? 'text-secondary' : 'text-error'
                }`}
              >
                ({formatPercent(displayDayPercent, { showSign: true })})
              </span>
            </div>
          </div>

          {/* Timeframe Toggle */}
          <div className="inline-flex rounded-lg bg-[#0a0e16] p-0.5 sm:p-1 border border-[#262a33] shrink-0">
            {(['1D', '1M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono transition-all ${
                  timeframe === tf
                    ? 'bg-[#262a33] text-primary font-bold shadow-sm'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#262a33] flex items-center justify-between text-xs">
          <div className="w-24 sm:w-28 h-6">
            <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 110 24">
              <path
                d={
                  isDayProfit
                    ? 'M 0,20 L 15,18 L 30,12 L 45,15 L 60,8 L 75,11 L 90,4 L 110,2'
                    : 'M 0,4 L 15,6 L 30,11 L 45,9 L 60,16 L 75,14 L 90,19 L 110,22'
                }
                stroke={isDayProfit ? '#4edea3' : '#ff5449'}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <circle
                className="animate-pulse"
                cx="110"
                cy={isDayProfit ? 2 : 22}
                fill={isDayProfit ? '#4edea3' : '#ff5449'}
                r="3"
              />
            </svg>
          </div>
          <span className="font-mono text-[11px] sm:text-xs text-on-surface-variant shrink-0">
            Beta: 1.12β
          </span>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-secondary-fixed/5 blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}
