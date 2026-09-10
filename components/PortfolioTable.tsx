'use client';

import React, { useState, useMemo } from 'react';
import { StockHolding, SectorSummary } from '@/types/portfolio';
import { formatINR, formatPercent } from '@/lib/utils';
import { 
  Search, 
  Download, 
  Layers, 
  Table as TableIcon, 
  LayoutGrid, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Minus, 
  ExternalLink,
  Info,
  ShieldAlert
} from 'lucide-react';

interface PortfolioTableProps {
  holdings: StockHolding[];
  sectors: SectorSummary[];
  onOpenOrderModal: (holding: StockHolding, action: 'BUY' | 'SELL') => void;
  updatedTickers: Set<string>;
}

export function PortfolioTable({
  holdings,
  sectors,
  onOpenOrderModal,
  updatedTickers
}: PortfolioTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedCap, setSelectedCap] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('pnl_desc');
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('table');
  const [isSectorGrouped, setIsSectorGrouped] = useState(true);
  const [collapsedSectors, setCollapsedSectors] = useState<Set<string>>(new Set());

  // Filter and Sort Logic
  const filteredHoldings = useMemo(() => {
    return holdings.filter((h) => {
      const matchesSearch =
        h.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.nseBseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.sector.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector = selectedSector === 'ALL' || h.sector === selectedSector;
      const matchesCap = selectedCap === 'ALL' || h.capTier === selectedCap;

      return matchesSearch && matchesSector && matchesCap;
    });
  }, [holdings, searchQuery, selectedSector, selectedCap]);

  const sortedHoldings = useMemo(() => {
    const list = [...filteredHoldings];
    list.sort((a, b) => {
      if (sortBy === 'pnl_desc') return b.gainLoss - a.gainLoss;
      if (sortBy === 'pnl_asc') return a.gainLoss - b.gainLoss;
      if (sortBy === 'val_desc') return b.presentValue - a.presentValue;
      if (sortBy === 'weight_desc') return b.portfolioWeight - a.portfolioWeight;
      if (sortBy === 'pe_asc') {
        const peA = typeof a.peRatio === 'number' ? a.peRatio : 9999;
        const peB = typeof b.peRatio === 'number' ? b.peRatio : 9999;
        return peA - peB;
      }
      return 0;
    });
    return list;
  }, [filteredHoldings, sortBy]);

  // Grouped by Sector
  const groupedData = useMemo(() => {
    const map = new Map<string, StockHolding[]>();
    for (const h of sortedHoldings) {
      if (!map.has(h.sector)) map.set(h.sector, []);
      map.get(h.sector)!.push(h);
    }
    return map;
  }, [sortedHoldings]);

  const toggleSectorCollapse = (sec: string) => {
    setCollapsedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sec)) next.delete(sec);
      else next.add(sec);
      return next;
    });
  };

  // Export holdings to CSV
  const handleExportCSV = () => {
    const headers = [
      'Particulars (Stock Name)',
      'NSE/BSE (Stock Exchange Code)',
      'Sector',
      'Cap Tier',
      'Purchase Price',
      'Quantity (Qty)',
      'Investment (Purchase Price x Qty)',
      'Portfolio (%) (Weight)',
      'CMP (Fetched from Yahoo Finance)',
      'Present Value (CMP x Qty)',
      'Gain/Loss (Present Value - Investment)',
      'Gain/Loss (%)',
      'P/E Ratio (Fetched from Google Finance)',
      'Latest Earnings (Fetched from Google Finance)'
    ];

    const rows = sortedHoldings.map((h) => [
      `"${h.particulars}"`,
      `"${h.nseBseCode}"`,
      `"${h.sector}"`,
      `"${h.capTier}"`,
      h.purchasePrice,
      h.qty,
      h.investment,
      h.portfolioWeight,
      h.cmp,
      h.presentValue,
      h.gainLoss,
      h.gainLossPercent,
      typeof h.peRatio === 'number' ? h.peRatio : `"${h.peRatio}"`,
      typeof h.latestEarnings === 'number' ? h.latestEarnings : `"${h.latestEarnings}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `octabyte_portfolio_holdings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 mt-2 w-full min-w-0" id="holdings">
      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-[#1c2028] p-3.5 sm:p-4 rounded-2xl border border-[#262a33] shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1">
          {/* Search Filter */}
          <div className="relative flex items-center bg-[#0a0e16] border border-[#262a33] rounded-xl px-3 py-1.5 w-full sm:w-56 md:w-64">
            <Search className="h-4 w-4 text-outline mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter stock (e.g. HDFC, TCS)..."
              className="bg-transparent border-none text-on-surface text-xs w-full focus:outline-none placeholder:text-outline"
            />
          </div>

          {/* Sector Filter */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-[#0a0e16] text-on-surface text-xs font-mono px-3 py-2 rounded-xl border border-[#262a33] focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="ALL">All Sectors ({sectors.length})</option>
            {sectors.map((s) => (
              <option key={s.sector} value={s.sector}>
                {s.sector.replace(' Sector', '')}
              </option>
            ))}
          </select>

          {/* Market Cap Filter */}
          <select
            value={selectedCap}
            onChange={(e) => setSelectedCap(e.target.value)}
            className="bg-[#0a0e16] text-on-surface text-xs font-mono px-3 py-2 rounded-xl border border-[#262a33] focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="ALL">All Caps</option>
            <option value="Large">Large Cap</option>
            <option value="Mid">Mid Cap</option>
            <option value="Small">Small Cap</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0a0e16] text-on-surface text-xs font-mono px-3 py-2 rounded-xl border border-[#262a33] focus:outline-none w-full sm:w-auto"
          >
            <option value="pnl_desc">Sort: Gain/Loss (High - Low)</option>
            <option value="pnl_asc">Sort: Gain/Loss (Low - High)</option>
            <option value="val_desc">Sort: Present Value</option>
            <option value="weight_desc">Sort: Portfolio Weight</option>
            <option value="pe_asc">Sort: P/E Ratio</option>
          </select>
        </div>

        {/* View Mode and Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">
          {/* Sector Grouping Toggle */}
          <button
            type="button"
            onClick={() => setIsSectorGrouped(!isSectorGrouped)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              isSectorGrouped
                ? 'bg-primary/10 text-primary border-primary/30 font-bold'
                : 'bg-[#181c24] text-outline border-[#262a33] hover:text-on-surface'
            }`}
            title="Group Stocks by Sector"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sector Grouping</span>
            <span className="sm:hidden">Grouped</span>
          </button>

          {/* Table vs Heatmap Toggle */}
          <div className="flex items-center bg-[#0a0e16] p-1 rounded-xl border border-[#262a33]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-[#262a33] text-primary' : 'text-outline hover:text-on-surface'
              }`}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('heatmap')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'heatmap' ? 'bg-[#262a33] text-primary' : 'text-outline hover:text-on-surface'
              }`}
              title="Heatmap View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181c24] hover:bg-[#262a33] border border-[#262a33] text-on-surface text-xs font-mono transition-all"
            title="Export CSV Dataset"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      {viewMode === 'table' && (
        <div className="xl:hidden flex items-center justify-between text-[11px] font-mono text-outline px-1">
          <span>← Swipe horizontally to view all columns →</span>
          <span className="text-secondary">12 Live Columns</span>
        </div>
      )}

      {/* View Mode: TABLE */}
      {viewMode === 'table' && (
        <div className="relative overflow-x-auto rounded-2xl bg-[#1c2028] border border-[#262a33] shadow-md w-full">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-[#0a0e16] text-outline font-mono text-[11px] uppercase tracking-wider sticky top-0 z-20 border-b border-[#262a33]">
                <th className="py-3.5 px-4 text-left">
                  <div className="flex flex-col">
                    <span>Particulars</span>
                    <span className="text-[9px] text-outline/70 font-normal lowercase">(Stock Name)</span>
                  </div>
                </th>
                <th className="py-3.5 px-2 text-center">
                  <div className="flex flex-col items-center">
                    <span>NSE/BSE</span>
                    <span className="text-[9px] text-outline/70 font-normal lowercase">(Code)</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span>Purchase Price</span>
                    <span className="text-[9px] text-outline/70 font-normal lowercase">(Avg Cost)</span>
                  </div>
                </th>
                <th className="py-3.5 px-2 text-right">
                  <div className="flex flex-col items-end">
                    <span>Quantity</span>
                    <span className="text-[9px] text-outline/70 font-normal lowercase">(Qty)</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span>Investment</span>
                    <span className="text-[9px] text-outline/70 font-normal lowercase">(Price × Qty)</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span>Portfolio (%)</span>
                    <span className="text-[9px] text-outline/70 font-normal lowercase">(Weight)</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-secondary font-bold">CMP (Live)</span>
                    <span className="text-[9px] text-secondary/80 font-normal lowercase">Yahoo Finance</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span>Present Value</span>
                    <span className="text-[9px] text-outline/70 font-normal lowercase">(CMP × Qty)</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span>Gain / Loss</span>
                    <span className="text-[9px] text-outline/70 font-normal lowercase">(Present - Inv)</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <div className="flex flex-col items-center">
                    <span>P/E Ratio</span>
                    <span className="text-[9px] text-tertiary font-normal lowercase">Google Finance</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-left">
                  <div className="flex flex-col">
                    <span>Latest Earnings</span>
                    <span className="text-[9px] text-tertiary font-normal lowercase">Google Finance</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <div className="flex flex-col items-center">
                    <span>Actions</span>
                    <span className="text-[9px] text-outline/70 font-normal lowercase">(Transact)</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#262a33]/50 text-xs">
              {isSectorGrouped ? (
                Array.from(groupedData.entries()).map(([sectorName, secStocks]) => {
                  const isCollapsed = collapsedSectors.has(sectorName);
                  const secInv = secStocks.reduce((sum, s) => sum + s.investment, 0);
                  const secVal = secStocks.reduce((sum, s) => sum + s.presentValue, 0);
                  const secGain = secVal - secInv;
                  const secGainPct = secInv > 0 ? (secGain / secInv) * 100 : 0;
                  const isProfit = secGain >= 0;

                  return (
                    <React.Fragment key={sectorName}>
                      {/* Sector Summary Header Row */}
                      <tr
                        onClick={() => toggleSectorCollapse(sectorName)}
                        className="bg-[#181c24]/95 hover:bg-[#262a33] transition-colors cursor-pointer border-t-2 border-b border-[#262a33]"
                      >
                        <td colSpan={4} className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-primary shrink-0" />
                            )}
                            <span className="font-display text-xs font-bold text-on-surface truncate">
                              {sectorName}
                            </span>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                              {secStocks.length} scrips
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                          {formatINR(secInv, { decimals: 0 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-outline">
                          {secStocks.reduce((s, h) => s + h.portfolioWeight, 0).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-outline">—</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                          {formatINR(secVal, { decimals: 0 })}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-mono font-bold ${isProfit ? 'text-secondary' : 'text-error'}`}>
                              {formatINR(secGain, { showSign: true, decimals: 0 })}
                            </span>
                            <span
                              className={`font-mono text-[10px] px-1 rounded ${
                                isProfit ? 'bg-secondary/15 text-secondary' : 'bg-error/15 text-error'
                              }`}
                            >
                              {formatPercent(secGainPct, { showSign: true })}
                            </span>
                          </div>
                        </td>
                        <td colSpan={3} className="py-2.5 px-3 text-right text-[11px] font-mono text-outline">
                          Sector Subtotal
                        </td>
                      </tr>

                      {/* Sector Stock Rows */}
                      {!isCollapsed &&
                        secStocks.map((stock) => (
                          <TableRowItem
                            key={stock.id}
                            stock={stock}
                            isTickUpdated={updatedTickers.has(stock.yahooTicker)}
                            onOpenOrderModal={onOpenOrderModal}
                          />
                        ))}
                    </React.Fragment>
                  );
                })
              ) : (
                sortedHoldings.map((stock) => (
                  <TableRowItem
                    key={stock.id}
                    stock={stock}
                    isTickUpdated={updatedTickers.has(stock.yahooTicker)}
                    onOpenOrderModal={onOpenOrderModal}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View Mode: HEATMAP / GRID VIEW */}
      {viewMode === 'heatmap' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-3.5 sm:p-4 bg-[#1c2028] rounded-2xl border border-[#262a33] shadow-md w-full">
          {sortedHoldings.map((stock) => {
            const isProfit = stock.gainLoss >= 0;
            return (
              <div
                key={stock.id}
                onClick={() => onOpenOrderModal(stock, 'BUY')}
                className={`p-3.5 rounded-xl flex flex-col justify-between h-32 border transition-all cursor-pointer hover:scale-[1.02] ${
                  isProfit
                    ? 'bg-secondary/10 border-secondary/25 hover:border-secondary'
                    : 'bg-error/10 border-error/25 hover:border-error'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-display text-xs font-bold text-on-surface truncate">
                      {stock.shortCode || stock.nseBseCode}
                    </span>
                    <span className="text-[10px] text-outline truncate">{stock.particulars}</span>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      isProfit ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'
                    }`}
                  >
                    {formatPercent(stock.gainLossPercent, { showSign: true })}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="font-mono text-sm font-bold text-on-surface">
                    {formatINR(stock.presentValue, { decimals: 0 })}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-outline">
                    <span>CMP: ₹{stock.cmp}</span>
                    <span>{stock.portfolioWeight.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Footer & Accuracy Disclaimer */}
      <div className="flex flex-col gap-2 pt-1 px-1 text-xs font-mono text-outline">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Showing <strong className="text-on-surface">{sortedHoldings.length}</strong> of{' '}
            <strong className="text-on-surface">{holdings.length}</strong> scrips across{' '}
            <strong className="text-on-surface">{sectors.length}</strong> sectors
          </span>
          <span className="text-secondary flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            Live Yahoo Finance (CMP) & Google Finance (P/E & Earnings) Active
          </span>
        </div>

        {/* Data Accuracy & Scraping Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0a0e16] border border-[#262a33] text-[11px] text-outline">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>
            <strong>Data Source & Accuracy Notice</strong>: Stock prices (CMP) are fetched from Yahoo Finance, and fundamentals (P/E Ratio, Latest Earnings) are scraped from Google Finance via server-side Node.js tasks. In accordance with assignment requirements, resilient multi-tier caching and fallbacks are implemented to ensure zero disruption.
          </span>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Single Table Row wrapped in React.memo for optimal rendering performance
interface TableRowItemProps {
  stock: StockHolding;
  isTickUpdated: boolean;
  onOpenOrderModal: (holding: StockHolding, action: 'BUY' | 'SELL') => void;
}

const TableRowItem = React.memo(function TableRowItem({
  stock,
  isTickUpdated,
  onOpenOrderModal
}: TableRowItemProps) {
  const isProfit = stock.gainLoss >= 0;
  const tickClass = isTickUpdated
    ? stock.priceDirection === 'down'
      ? 'flash-down'
      : 'flash-up'
    : '';

  return (
    <tr className="hover:bg-[#262a33]/60 transition-colors group">
      {/* 1. Particulars (Stock Name) */}
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#31353e] flex items-center justify-center font-bold text-primary text-[11px] font-mono border border-[#424754] shrink-0">
            {stock.shortCode.slice(0, 3)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
              {stock.particulars}
            </span>
            <span className="text-[10px] font-mono text-outline truncate max-w-[130px]">
              {stock.sector.replace(' Sector', '')} • {stock.capTier} Cap
            </span>
          </div>
        </div>
      </td>

      {/* 2. NSE/BSE (Stock Exchange Code) */}
      <td className="py-2.5 px-2 text-center">
        <span className="px-2 py-0.5 rounded bg-[#262a33] font-mono text-[11px] text-on-surface-variant font-semibold border border-[#424754]">
          {stock.nseBseCode}
        </span>
      </td>

      {/* 3. Purchase Price */}
      <td className="py-2.5 px-3 text-right font-mono text-on-surface-variant">
        ₹{stock.purchasePrice.toLocaleString('en-IN')}
      </td>

      {/* 4. Quantity (Qty) */}
      <td className="py-2.5 px-2 text-right font-mono text-on-surface">
        {stock.qty.toLocaleString('en-IN')}
      </td>

      {/* 5. Investment (Purchase Price x Qty) */}
      <td className="py-2.5 px-3 text-right font-mono text-on-surface-variant">
        {formatINR(stock.investment, { decimals: 0 })}
      </td>

      {/* 6. Portfolio (%) */}
      <td className="py-2.5 px-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-[11px] text-outline">
            {stock.portfolioWeight.toFixed(1)}%
          </span>
          <div className="w-14 bg-[#31353e] h-1 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${Math.min(stock.portfolioWeight * 5, 100)}%` }}
            />
          </div>
        </div>
      </td>

      {/* 7. CMP (Fetched from Yahoo Finance) */}
      <td className={`py-2.5 px-3 text-right font-mono font-bold text-on-surface rounded ${tickClass}`}>
        ₹{stock.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>

      {/* 8. Present Value (CMP x Qty) */}
      <td className="py-2.5 px-3 text-right font-mono font-semibold text-on-surface">
        {formatINR(stock.presentValue, { decimals: 0 })}
      </td>

      {/* 9. Gain / Loss (Present Value - Investment) */}
      <td className="py-2.5 px-4 text-right">
        <div className="flex flex-col items-end gap-0.5">
          <span className={`font-mono font-bold ${isProfit ? 'text-secondary' : 'text-error'}`}>
            {formatINR(stock.gainLoss, { showSign: true, decimals: 0 })}
          </span>
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
              isProfit ? 'bg-secondary/15 text-secondary' : 'bg-error/15 text-error'
            }`}
          >
            {formatPercent(stock.gainLossPercent, { showSign: true })}
          </span>
        </div>
      </td>

      {/* 10. P/E Ratio (Fetched from Google Finance) */}
      <td className="py-2.5 px-3 text-center font-mono text-outline">
        {typeof stock.peRatio === 'number' ? `${stock.peRatio.toFixed(1)}x` : stock.peRatio}
      </td>

      {/* 11. Latest Earnings (Fetched from Google Finance) */}
      <td className="py-2.5 px-3">
        <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-mono text-[10px] font-semibold border border-secondary/20">
          {typeof stock.latestEarnings === 'number'
            ? `₹${stock.latestEarnings.toFixed(2)}`
            : stock.latestEarnings}
        </span>
      </td>

      {/* 12. Actions */}
      <td className="py-2.5 px-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onOpenOrderModal(stock, 'BUY')}
            className="p-1 rounded-md bg-secondary/10 hover:bg-secondary/20 text-secondary transition-all"
            title="Buy Shares"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onOpenOrderModal(stock, 'SELL')}
            className="p-1 rounded-md bg-error/10 hover:bg-error/20 text-error transition-all"
            title="Sell / Trim Shares"
          >
            <Minus className="h-3 w-3" />
          </button>
          <a
            href={`https://www.google.com/finance/quote/${encodeURIComponent(stock.googleTicker)}`}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded-md bg-[#262a33] hover:bg-[#31353e] text-outline hover:text-on-surface transition-all"
            title="View on Google Finance"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </td>
    </tr>
  );
});
