import React from 'react';
import { useNotification } from './NotificationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let Icon = Info;
        let bgClass = 'bg-blue-600 text-white';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          bgClass = 'bg-emerald-600 text-white';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          bgClass = 'bg-amber-500 text-slate-900';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          bgClass = 'bg-rose-600 text-white';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg ${bgClass} transform transition-all duration-300 animate-slide-up`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.title && <div className="font-bold text-xs uppercase tracking-wider mb-0.5 opacity-90">{toast.title}</div>}
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-75 transition-opacity rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
