import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-white border-emerald-500 text-slate-800 shadow-lg shadow-emerald-500/10',
            warning: 'bg-white border-amber-500 text-slate-800 shadow-lg shadow-amber-500/10',
            error: 'bg-white border-rose-500 text-slate-800 shadow-lg shadow-rose-500/10',
            info: 'bg-white border-blue-500 text-slate-800 shadow-lg shadow-blue-500/10',
          }[toast.type];

          const IconComponent = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
            error: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border-l-4 rounded-xl p-4 flex items-start gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${typeStyles}`}
            >
              <div className="mt-0.5">{IconComponent}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-slate-600 mt-1 leading-normal">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
