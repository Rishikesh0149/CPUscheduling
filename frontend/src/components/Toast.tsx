import React from 'react';
import { Toast } from '../hooks/useToast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 size={18} className="text-emerald-400" />,
          error: <AlertCircle size={18} className="text-rose-400" />,
          info: <Info size={18} className="text-indigo-400" />,
        };

        return (
          <div key={toast.id} className={`toast-notification toast-${toast.type}`}>
            <span className="toast-icon">{icons[toast.type]}</span>
            <div className="toast-body">
              <p className="toast-message">{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="toast-close"
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
