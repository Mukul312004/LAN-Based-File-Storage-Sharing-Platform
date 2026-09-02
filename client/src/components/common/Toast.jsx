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
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full">
      <div
        className={`p-3 rounded-md border flex items-start space-x-2.5 transition font-mono text-xs ${
          isError
            ? 'bg-cursor-card dark:bg-cursor-dark-card border-[#cf2d56]/40 text-[#cf2d56]'
            : isSuccess
            ? 'bg-cursor-card dark:bg-cursor-dark-card border-[#9fc9a2]/60 text-[#1f8a65] dark:text-[#9fc9a2]'
            : 'bg-cursor-card dark:bg-cursor-dark-card border-cursor-hairline dark:border-cursor-dark-hairline text-cursor-ink dark:text-cursor-dark-ink'
        }`}
      >
        {isError && <AlertCircle className="w-4 h-4 text-[#cf2d56] shrink-0 mt-0.5" />}
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#1f8a65] dark:text-[#9fc9a2] shrink-0 mt-0.5" />}
        {!isError && !isSuccess && <Info className="w-4 h-4 text-cursor-orange shrink-0 mt-0.5" />}

        <div className="flex-1 font-normal">{toast.message}</div>

        <button
          onClick={onClose}
          className="text-cursor-muted hover:text-cursor-ink dark:hover:text-cursor-dark-ink p-0.5 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
