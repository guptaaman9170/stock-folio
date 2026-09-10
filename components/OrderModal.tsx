'use client';

import React, { useState } from 'react';
import { StockHolding } from '@/types/portfolio';
import { formatINR } from '@/lib/utils';
import { X, CheckCircle, ArrowRight } from 'lucide-react';

interface OrderModalProps {
  holding: StockHolding | null;
  action: 'BUY' | 'SELL';
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (holding: StockHolding, action: 'BUY' | 'SELL', qty: number, price: number) => void;
}

export function OrderModal({
  holding,
  action,
  isOpen,
  onClose,
  onConfirmOrder
}: OrderModalProps) {
  if (!isOpen || !holding) return null;

  const [qty, setQty] = useState<number>(holding.qty > 50 ? 50 : holding.qty || 10);
  const [price, setPrice] = useState<number>(holding.cmp);
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET' | 'SL-M'>('LIMIT');

  const estimatedTotal = (qty || 0) * (price || 0);

  const handleExecute = () => {
    onConfirmOrder(holding, action, qty, price);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e16]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1c2028] border border-[#262a33] rounded-2xl p-6 w-full max-w-md shadow-2xl relative flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2 py-0.5 rounded font-mono text-xs font-bold uppercase tracking-wider ${
                action === 'BUY'
                  ? 'bg-secondary/15 text-secondary border border-secondary/20'
                  : 'bg-error/15 text-error border border-error/20'
              }`}
            >
              {action} ORDER
            </span>
            <span className="font-display text-base font-bold text-on-surface">
              {holding.particulars}
            </span>
            <span className="font-mono text-xs text-outline">({holding.nseBseCode})</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-[#262a33] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Order Type Buttons */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
            Execution Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['LIMIT', 'MARKET', 'SL-M'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`py-1.5 rounded-xl font-mono text-xs transition-all border ${
                  orderType === type
                    ? 'bg-primary-container text-on-primary-container font-bold border-primary'
                    : 'bg-[#181c24] text-outline border-[#262a33] hover:text-on-surface'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
              Quantity (Shares)
            </label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 0))}
              className="bg-[#0a0e16] text-on-surface font-mono text-sm p-2.5 rounded-xl border border-[#262a33] focus:border-primary/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
              Price (INR)
            </label>
            <input
              type="number"
              step="0.05"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              disabled={orderType === 'MARKET'}
              className="bg-[#0a0e16] text-on-surface font-mono text-sm p-2.5 rounded-xl border border-[#262a33] focus:border-primary/50 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Estimated Total Outlay */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0e16] border border-[#262a33]">
          <span className="text-xs text-outline">Estimated Outlay:</span>
          <span className="font-mono text-base font-bold text-primary">
            {formatINR(estimatedTotal)}
          </span>
        </div>

        {/* Modal Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-[#181c24] hover:bg-[#262a33] text-outline hover:text-on-surface font-mono text-xs border border-[#262a33] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecute}
            className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 ${
              action === 'BUY'
                ? 'bg-secondary text-[#001a42] hover:brightness-110'
                : 'bg-error text-white hover:brightness-110'
            }`}
          >
            <span>Transact {action}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
