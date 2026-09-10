'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { AlphaInsights } from '@/components/AlphaInsights';
import { PortfolioCharts } from '@/components/PortfolioCharts';
import { SectorCards } from '@/components/SectorCards';
import { PortfolioTable } from '@/components/PortfolioTable';
import { OrderModal } from '@/components/OrderModal';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { PortfolioResponse, StockHolding } from '@/types/portfolio';
import { AlertCircle, RefreshCw } from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 15;

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_INTERVAL_SECONDS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track tickers that updated on the latest tick for flash animations
  const [updatedTickers, setUpdatedTickers] = useState<Set<string>>(new Set());

  // Order modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockHolding | null>(null);
  const [orderAction, setOrderAction] = useState<'BUY' | 'SELL'>('BUY');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const previousHoldingsRef = useRef<Map<string, number>>(new Map());

  const fetchPortfolioData = useCallback(async (isBackground: boolean = false) => {
    if (!isBackground) setIsRefreshing(true);
    try {
      const res = await fetch('/api/portfolio', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const json: PortfolioResponse = await res.json();

      // Detect which tickers changed CMP
      const newUpdated = new Set<string>();
      if (previousHoldingsRef.current.size > 0 && json.holdings) {
        for (const h of json.holdings) {
          const oldCMP = previousHoldingsRef.current.get(h.yahooTicker);
          if (oldCMP !== undefined && oldCMP !== h.cmp) {
            newUpdated.add(h.yahooTicker);
          }
        }
      }

      const newMap = new Map<string, number>();
      json.holdings?.forEach((h) => newMap.set(h.yahooTicker, h.cmp));
      previousHoldingsRef.current = newMap;

      setData(json);
      setUpdatedTickers(newUpdated);
      setErrorMessage(null);

      if (newUpdated.size > 0) {
        setTimeout(() => setUpdatedTickers(new Set()), 2000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch live stock data';
      setErrorMessage(msg);
      if (!data) {
        addToast('Connection Notice', 'Using cached/baseline financial data.', 'info');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setSecondsLeft(REFRESH_INTERVAL_SECONDS);
    }
  }, [data]);

  useEffect(() => {
    fetchPortfolioData(false);
  }, [fetchPortfolioData]);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          fetchPortfolioData(true);
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [fetchPortfolioData]);

  const handleOpenOrder = (holding: StockHolding, action: 'BUY' | 'SELL') => {
    setSelectedStock(holding);
    setOrderAction(action);
    setOrderModalOpen(true);
  };

  const handleConfirmOrder = (
    holding: StockHolding,
    action: 'BUY' | 'SELL',
    qty: number,
    price: number
  ) => {
    addToast(
      `Order Routed: ${action} ${holding.nseBseCode}`,
      `Executed ${qty} shares at ₹${price.toFixed(2)} via Institutional Gateway.`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Sidebar Navigation with Mobile Drawer */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Full width on mobile/tablet, shifted on lg+) */}
      <div className="pl-0 lg:pl-64 xl:pl-72 transition-all duration-300 w-full min-w-0">
        {/* Fixed Top Header */}
        <Header
          isMarketOpen={data?.isMarketOpen ?? true}
          isRefreshing={isRefreshing}
          secondsLeft={secondsLeft}
          onRefresh={() => fetchPortfolioData(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="relative pt-20 px-3.5 sm:px-6 pb-16 min-h-screen flex flex-col gap-5 sm:gap-6 max-w-[1600px] mx-auto w-full min-w-0 overflow-x-hidden">
          {/* Sub-Header / Nav Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-lg sm:text-2xl font-bold text-on-surface tracking-tight">
                  Portfolio Executive Analytics
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-mono text-[10px] sm:text-xs uppercase tracking-wider border border-secondary/20 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-ping" />
                  Realtime Feeds
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Dynamic equity intelligence, live performance attribution & sector-level exposure.
              </p>
            </div>

            {/* Tab Pill Switcher (Scrollable on small mobile) */}
            <div className="flex items-center p-1 rounded-xl bg-[#1c2028] border border-[#262a33] overflow-x-auto self-start sm:self-auto max-w-full">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'holdings', label: `Holdings (${data?.holdings?.length || 26})` },
                { id: 'analytics', label: 'Analytics' },
                { id: 'sectors', label: 'Sectors' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner if API Fails */}
          {errorMessage && (
            <div className="bg-error/10 border border-error/30 p-3.5 rounded-xl flex items-center justify-between text-xs text-error">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>External financial feeds throttled: {errorMessage}. Displaying cached dataset.</span>
              </div>
              <button
                type="button"
                onClick={() => fetchPortfolioData(false)}
                className="px-2.5 py-1 rounded bg-error/20 hover:bg-error/30 font-bold transition-all shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="flex flex-col gap-6 py-16 items-center justify-center">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="font-display text-sm font-bold text-on-surface">
                  Connecting to Yahoo Finance & Google Finance...
                </span>
                <span className="text-xs text-outline font-mono">
                  Aggregating real-time CMP quotes and earnings data
                </span>
              </div>
            </div>
          ) : data ? (
            <>
              {/* SECTION 1: Top 4 Bento Cards */}
              <ExecutiveSummary
                totalInvestment={data.summary.totalInvestment}
                totalPresentValue={data.summary.totalPresentValue}
                netGainLoss={data.summary.netGainLoss}
                netGainLossPercent={data.summary.netGainLossPercent}
                dayGainLoss={data.summary.dayGainLoss}
                dayGainLossPercent={data.summary.dayGainLossPercent}
                stockCount={data.summary.stockCount}
              />

              {/* SECTION 2: AI Alpha Insights */}
              {(activeTab === 'overview' || activeTab === 'analytics') && (
                <AlphaInsights
                  topPerformer={data.summary.topPerformer}
                  laggingPerformer={data.summary.laggingPerformer}
                  highestValuation={data.summary.highestValuation}
                  largestHolding={data.summary.largestHolding}
                />
              )}

              {/* SECTION 3: Visual Charts */}
              {(activeTab === 'overview' || activeTab === 'analytics') && (
                <PortfolioCharts
                  holdings={data.holdings}
                  sectors={data.sectors}
                  totalPresentValue={data.summary.totalPresentValue}
                  totalInvestment={data.summary.totalInvestment}
                />
              )}

              {/* SECTION 4: Sector Performance Cards */}
              {(activeTab === 'overview' || activeTab === 'sectors') && (
                <SectorCards sectors={data.sectors} />
              )}

              {/* SECTION 5: Comprehensive Holdings Table with Sector Grouping */}
              {(activeTab === 'overview' || activeTab === 'holdings') && (
                <PortfolioTable
                  holdings={data.holdings}
                  sectors={data.sectors}
                  onOpenOrderModal={handleOpenOrder}
                  updatedTickers={updatedTickers}
                />
              )}
            </>
          ) : null}
        </main>
      </div>

      {/* Order Execution Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        holding={selectedStock}
        action={orderAction}
        onClose={() => setOrderModalOpen(false)}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
