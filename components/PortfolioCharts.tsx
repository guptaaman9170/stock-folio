'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { SectorSummary, StockHolding } from '@/types/portfolio';
import { formatINR } from '@/lib/utils';

interface PortfolioChartsProps {
  holdings: StockHolding[];
  sectors: SectorSummary[];
  totalPresentValue: number;
  totalInvestment: number;
}

export function PortfolioCharts({
  holdings,
  sectors,
  totalPresentValue,
  totalInvestment
}: PortfolioChartsProps) {
  const [chartRange, setChartRange] = useState<'1M' | '6M' | '1Y' | '3Y' | 'ALL'>('1Y');

  // Benchmark Curve Data Generator based on selected range
  const generateBenchmarkData = () => {
    switch (chartRange) {
      case '1M':
        return [
          { date: 'Week 1', portfolio: 6150000, nifty: 24500 },
          { date: 'Week 2', portfolio: 6200000, nifty: 24620 },
          { date: 'Week 3', portfolio: 6310000, nifty: 24710 },
          { date: 'Week 4', portfolio: totalPresentValue, nifty: 24852 }
        ];
      case '6M':
        return [
          { date: 'Month 1', portfolio: 5400000, nifty: 22800 },
          { date: 'Month 2', portfolio: 5650000, nifty: 23200 },
          { date: 'Month 3', portfolio: 5800000, nifty: 23900 },
          { date: 'Month 4', portfolio: 6050000, nifty: 24200 },
          { date: 'Month 5', portfolio: 6220000, nifty: 24550 },
          { date: 'Today', portfolio: totalPresentValue, nifty: 24852 }
        ];
      case '1Y':
      default:
        return [
          { date: 'Nov 23', portfolio: 4825000, nifty: 20100 },
          { date: 'Jan 24', portfolio: 5120000, nifty: 21450 },
          { date: 'Apr 24', portfolio: 5480000, nifty: 22400 },
          { date: 'Jul 24', portfolio: 5920000, nifty: 24100 },
          { date: 'Oct 24', portfolio: 6240000, nifty: 24600 },
          { date: 'Today', portfolio: totalPresentValue, nifty: 24852 }
        ];
    }
  };

  const benchmarkData = generateBenchmarkData();

  // Cap Size Distribution
  const capData = [
    {
      name: 'Large Cap (Top 100)',
      value: holdings.filter((h) => h.capTier === 'Large').reduce((acc, h) => acc + h.presentValue, 0),
      color: '#4d8eff'
    },
    {
      name: 'Mid Cap Growth (101-250)',
      value: holdings.filter((h) => h.capTier === 'Mid').reduce((acc, h) => acc + h.presentValue, 0),
      color: '#4cd7f6'
    },
    {
      name: 'Small Cap Alpha (251+)',
      value: holdings.filter((h) => h.capTier === 'Small').reduce((acc, h) => acc + h.presentValue, 0),
      color: '#4edea3'
    }
  ];

  // Sector Bar Comparison Data
  const sectorSpreadData = sectors.map((sec) => ({
    name: sec.sector.replace(' Sector', ''),
    invested: sec.totalInvestment,
    presentValue: sec.totalPresentValue
  }));

  // Sector Colors
  const SECTOR_COLORS = ['#4d8eff', '#4edea3', '#acedff', '#d8e2ff', '#4cd7f6', '#adc6ff'];

  const sectorDonutData = sectors.map((sec, idx) => ({
    name: sec.sector,
    value: sec.totalPresentValue,
    color: SECTOR_COLORS[idx % SECTOR_COLORS.length]
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Charts Row 1: Benchmark Comparative Line/Area Chart + Cap Donut */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Chart 1: Alpha Generation Curve (Spans 2 cols) */}
        <div className="xl:col-span-2 rounded-2xl bg-[#1c2028] p-5 flex flex-col justify-between border border-[#262a33] shadow-md relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262a33]">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold text-on-surface">
                  Alpha Generation Curve
                </span>
                <span className="px-2 py-0.5 rounded bg-[#262a33] font-mono text-[11px] text-secondary font-bold border border-secondary/20">
                  +12.4% vs NIFTY
                </span>
              </div>
              <span className="text-xs text-outline">
                Portfolio Mark-to-Market Equity vs NIFTY 50 TRI Benchmark
              </span>
            </div>

            {/* Timeframe Range Selector */}
            <div className="inline-flex rounded-lg bg-[#0a0e16] p-1 border border-[#262a33] self-start sm:self-auto">
              {(['1M', '6M', '1Y', '3Y', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setChartRange(range)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    chartRange === range
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-4 rounded bg-primary" />
              <span className="text-xs text-on-surface">Obsidian Portfolio</span>
              <span className="font-mono text-xs font-bold text-primary">
                {formatINR(totalPresentValue, { decimals: 0 })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-4 rounded bg-outline" />
              <span className="text-xs text-outline">NIFTY 50 Index</span>
              <span className="font-mono text-xs text-outline">24,852.40</span>
            </div>
          </div>

          {/* Area Chart */}
          <div className="w-full h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={benchmarkData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4d8eff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4d8eff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262a33" vertical={false} />
                <XAxis dataKey="date" stroke="#8c909f" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8c909f"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                  domain={['dataMin - 200000', 'dataMax + 200000']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181c24',
                    borderColor: '#262a33',
                    borderRadius: '0.75rem',
                    color: '#dfe2ee',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [formatINR(Number(value)), 'Portfolio Value']}
                />
                <Area
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#4d8eff"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPortfolio)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cap Allocation Donut */}
        <div className="rounded-2xl bg-[#1c2028] p-5 flex flex-col justify-between border border-[#262a33] shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#262a33]">
            <div className="flex flex-col">
              <span className="font-display text-base font-bold text-on-surface">
                Market Cap Size
              </span>
              <span className="text-xs text-outline">Weight distribution by cap tier</span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#262a33] text-primary">
              3 Tiers
            </span>
          </div>

          <div className="relative flex items-center justify-center my-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {capData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181c24',
                    borderColor: '#262a33',
                    borderRadius: '0.75rem',
                    color: '#dfe2ee',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [formatINR(Number(val)), 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
                Total Value
              </span>
              <span className="font-mono text-base font-bold text-on-surface">
                ₹{(totalPresentValue / 100000).toFixed(1)}L
              </span>
              <span className="text-[10px] font-mono text-secondary">
                {holdings.length} Scrips
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[#262a33]">
            {capData.map((item) => {
              const pct = totalPresentValue > 0 ? (item.value / totalPresentValue) * 100 : 0;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#262a33] transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-on-surface truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-on-surface">
                      {formatINR(item.value, { decimals: 0 })}
                    </span>
                    <span
                      className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Sector Matrix + Capital Spread Bar Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Chart 3: Sector Distribution Weighted Donut & Progress */}
        <div className="rounded-2xl bg-[#1c2028] p-5 flex flex-col justify-between border border-[#262a33] shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#262a33]">
            <div className="flex flex-col">
              <span className="font-display text-base font-bold text-on-surface">
                Sector Allocation Matrix
              </span>
              <span className="text-xs text-outline">Weightage exposure across primary industries</span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#262a33] text-primary">
              {sectors.length} Sectors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-3">
            <div className="relative flex items-center justify-center h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sectorDonutData.map((entry, index) => (
                      <Cell key={`sec-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181c24',
                      borderColor: '#262a33',
                      borderRadius: '0.75rem',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [formatINR(Number(val)), 'Present Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center pointer-events-none">
                <span className="text-[10px] font-mono text-outline">Top Sector</span>
                <span className="font-mono text-xs font-bold text-primary">
                  {sectors[0]?.sector.replace(' Sector', '') || ''}
                </span>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="flex flex-col gap-2">
              {sectors.slice(0, 5).map((sec, idx) => {
                const color = SECTOR_COLORS[idx % SECTOR_COLORS.length];
                return (
                  <div key={sec.sector} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                        {sec.sector.replace(' Sector', '')}
                      </span>
                      <span className="font-mono text-outline">
                        {sec.portfolioWeight.toFixed(1)}% ({formatINR(sec.totalPresentValue, { decimals: 0 })})
                      </span>
                    </div>
                    <div className="w-full bg-[#262a33] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(sec.portfolioWeight, 100)}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#262a33] flex items-center justify-between text-xs font-mono text-outline">
            <span>Aggregated Investment: {formatINR(totalInvestment, { decimals: 0 })}</span>
            <span className="text-secondary font-bold">Value: {formatINR(totalPresentValue, { decimals: 0 })}</span>
          </div>
        </div>

        {/* Chart 4: Capital Spread Cost vs Value Bar Chart */}
        <div className="rounded-2xl bg-[#1c2028] p-5 flex flex-col justify-between border border-[#262a33] shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#262a33]">
            <div className="flex flex-col">
              <span className="font-display text-base font-bold text-on-surface">
                Capital Spread: Cost vs Current Value
              </span>
              <span className="text-xs text-outline">Gain magnitude per sector</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-primary" />
                <span className="text-outline">Cost Basis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-secondary" />
                <span className="text-secondary font-bold">Current Mkt</span>
              </div>
            </div>
          </div>

          <div className="w-full h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorSpreadData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262a33" vertical={false} />
                <XAxis dataKey="name" stroke="#8c909f" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8c909f"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181c24',
                    borderColor: '#262a33',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: any) => [
                    formatINR(Number(value)),
                    name === 'invested' ? 'Cost Basis' : 'Current Market Value'
                  ]}
                />
                <Bar dataKey="invested" name="invested" fill="#4d8eff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="presentValue" name="presentValue" fill="#4edea3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-[#262a33] flex items-center justify-between text-xs font-mono text-outline">
            <span>Portfolio Gain: {formatINR(totalPresentValue - totalInvestment, { showSign: true, decimals: 0 })}</span>
            <span className="text-secondary font-bold">
              +{(((totalPresentValue - totalInvestment) / totalInvestment) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
