'use client';

import React from 'react';
import { SectorSummary } from '@/types/portfolio';
import { formatINR, formatPercent } from '@/lib/utils';
import { Layers } from 'lucide-react';

interface SectorCardsProps {
  sectors: SectorSummary[];
  onSelectSector?: (sector: string) => void;
}

export function SectorCards({ sectors, onSelectSector }: SectorCardsProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary shrink-0" />
          <span className="font-display text-xs sm:text-sm font-bold text-on-surface">
            Sector Performance Deep-Dive
          </span>
        </div>
        <span className="text-[11px] font-mono text-outline">
          {sectors.length} Sectors Active in Mandate
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
        {sectors.map((sec) => {
          const isProfit = sec.gainLoss >= 0;
          return (
            <div
              key={sec.sector}
              onClick={() => onSelectSector && onSelectSector(sec.sector)}
              className="rounded-2xl bg-[#1c2028] p-3.5 sm:p-4 flex flex-col justify-between border border-[#262a33] shadow-sm hover:border-primary/50 hover:bg-[#262a33]/60 transition-all cursor-pointer group"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display text-xs sm:text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                    {sec.sector.replace(' Sector', '')}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-semibold border border-primary/20 shrink-0">
                    {sec.portfolioWeight.toFixed(0)}%
                  </span>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-outline truncate">
                  {sec.stocks.map((s) => s.shortCode || s.nseBseCode).slice(0, 3).join(', ')}
                  {sec.stocks.length > 3 ? ` +${sec.stocks.length - 3}` : ''}
                </span>
              </div>

              <div className="my-2.5 sm:my-3 flex flex-col gap-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-outline">Invested</span>
                  <span className="text-on-surface">{formatINR(sec.totalInvestment, { decimals: 0 })}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-outline">Current Val</span>
                  <span className="text-primary font-semibold">{formatINR(sec.totalPresentValue, { decimals: 0 })}</span>
                </div>
                <div className="flex justify-between font-mono pt-1 border-t border-[#262a33]">
                  <span className="text-outline">Return</span>
                  <span className={`font-bold ${isProfit ? 'text-secondary' : 'text-error'}`}>
                    {formatPercent(sec.gainLossPercent, { showSign: true })}
                  </span>
                </div>
              </div>

              <div className="w-full bg-[#31353e] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isProfit ? 'bg-secondary' : 'bg-error'}`}
                  style={{ width: `${Math.min(Math.abs(sec.gainLossPercent), 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
