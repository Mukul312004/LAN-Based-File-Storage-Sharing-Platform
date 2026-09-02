import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-short">
      <div
        className={`p-4 rounded-xl shadow-lg border flex items-start space-x-3 ${
          isError
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : isSuccess
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}
      >
        {isError && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
        {!isError && !isSuccess && <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}

        <div className="flex-1 text-sm font-medium">{toast.message}</div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
