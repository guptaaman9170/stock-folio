'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  PieChart, 
  CandlestickChart, 
  Donut, 
  Eye, 
  FileText, 
  Sliders,
  TrendingUp,
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ 
  activeTab, 
  setActiveTab,
  isOpenMobile,
  onCloseMobile
}: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'holdings', label: 'Portfolio Holdings', icon: PieChart },
    { id: 'analytics', label: 'Analytics & Charts', icon: CandlestickChart },
    { id: 'sectors', label: 'Sector Allocation', icon: Donut },
    { id: 'watchlist', label: 'Watchlist', icon: Eye },
    { id: 'reports', label: 'Tax & Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#0a0e16] z-50 flex flex-col justify-between py-5 px-4 border-r border-[#262a33] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:w-64 xl:w-72`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand Header + Close Button on Mobile */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-on-primary-container font-black shadow-lg shadow-primary-container/20">
                <ShieldCheck className="h-6 w-6 text-[#001a42]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-on-surface tracking-tight leading-tight">
                  Obsidian Alpha
                </span>
                <span className="text-[11px] font-mono text-outline uppercase tracking-wider">
                  Institutional Desk
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-[#262a33] transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-surface-container-high text-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                  type="button"
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-outline'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Indices Quick View at sidebar bottom */}
        <div className="flex flex-col gap-2 bg-[#181c24]/90 p-3.5 rounded-xl border border-[#262a33] backdrop-blur-md">
          <div className="flex items-center justify-between pb-1 border-b border-[#262a33]">
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-secondary" />
              Market Indices
            </span>
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">NIFTY 50</span>
              <span className="font-mono text-[11px] text-outline">24,852.40</span>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20">
              <span className="font-mono text-xs text-secondary font-semibold">+0.82%</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">SENSEX</span>
              <span className="font-mono text-[11px] text-outline">81,720.15</span>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20">
              <span className="font-mono text-xs text-secondary font-semibold">+0.74%</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
