'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;
        const iconColor =
          toast.type === 'error'
            ? 'text-error'
            : toast.type === 'info'
            ? 'text-primary'
            : 'text-secondary';

        return (
          <div
            key={toast.id}
            className="bg-[#1c2028]/95 backdrop-blur-md border border-[#262a33] px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between pointer-events-auto transition-all animate-in slide-in-from-bottom-5 duration-200"
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${iconColor}`} />
              <div className="flex flex-col">
                <span className="font-display text-xs font-bold text-on-surface">
                  {toast.title}
                </span>
                <span className="text-[11px] text-outline">{toast.message}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md text-outline hover:text-on-surface transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
