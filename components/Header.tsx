'use client';

import React from 'react';
import { 
  Search, 
  RefreshCw, 
  Bell, 
  Moon, 
  Activity,
  Menu
} from 'lucide-react';

interface HeaderProps {
  isMarketOpen: boolean;
  isRefreshing: boolean;
  secondsLeft: number;
  onRefresh: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenMobileSidebar: () => void;
}

export function Header({
  isMarketOpen,
  isRefreshing,
  secondsLeft,
  onRefresh,
  searchQuery,
  setSearchQuery,
  onOpenMobileSidebar
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 lg:left-64 xl:left-72 right-0 h-16 bg-[#0a0e16]/90 backdrop-blur-xl z-30 px-3 sm:px-6 flex items-center justify-between border-b border-[#262a33] shadow-sm transition-all">
      {/* Left: Mobile Menu Trigger & Portfolio Title */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Hamburger Menu on Mobile/Tablet */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-[#181c24] border border-[#262a33] text-on-surface hover:bg-[#262a33] transition-all"
          title="Open Navigation"
        >
          <Menu className="h-5 w-5 text-primary" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-display text-sm sm:text-base xl:text-lg font-bold text-on-surface truncate max-w-[150px] sm:max-w-xs md:max-w-none">
            Executive Portfolio
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#262a33] font-mono text-[10px] text-primary uppercase tracking-wide border border-primary/20">
            NSE / BSE Live
          </span>
        </div>

        {/* Live sync pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#181c24] border border-[#262a33]">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isMarketOpen ? 'bg-secondary' : 'bg-outline'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isMarketOpen ? 'bg-secondary' : 'bg-outline'}`} />
          </span>
          <span className={`text-[11px] font-bold font-mono tracking-wider ${isMarketOpen ? 'text-secondary' : 'text-outline'}`}>
            {isMarketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
          </span>
          <span className="text-outline text-xs">•</span>
          <span className="font-mono text-xs text-outline flex items-center gap-1">
            <Activity className="h-3 w-3 text-secondary" />
            {secondsLeft}s sync
          </span>
        </div>
      </div>

      {/* Right: Search, Refresh, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search input (collapses gracefully on mobile) */}
        <div className="relative flex items-center bg-[#181c24] border border-[#262a33] rounded-xl px-2.5 sm:px-3 py-1.5 w-32 sm:w-56 md:w-64 focus-within:border-primary/50 transition-all">
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-outline mr-1.5 sm:mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scrips..."
            className="bg-transparent border-none text-on-surface text-xs w-full focus:outline-none placeholder:text-outline truncate"
          />
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 px-2.5 sm:px-3 flex items-center gap-1.5 rounded-xl bg-[#181c24] border border-[#262a33] text-on-surface-variant hover:bg-[#262a33] hover:text-on-surface transition-all disabled:opacity-50"
          title="Force Real-time Refresh"
          type="button"
        >
          <RefreshCw className={`h-4 w-4 text-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline font-mono text-xs">Sync</span>
        </button>

        {/* Notifications */}
        <div className="relative hidden sm:block">
          <button
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#181c24] border border-[#262a33] text-on-surface-variant hover:bg-[#262a33] hover:text-on-surface transition-all"
            title="Institutional Alerts"
            type="button"
          >
            <Bell className="h-4 w-4" />
          </button>
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-secondary ring-2 ring-[#0a0e16]" />
        </div>

        {/* User profile avatar */}
        <div className="flex items-center pl-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center font-bold text-xs text-[#001a42] shadow-inner">
            OB
          </div>
        </div>
      </div>
    </header>
  );
}
