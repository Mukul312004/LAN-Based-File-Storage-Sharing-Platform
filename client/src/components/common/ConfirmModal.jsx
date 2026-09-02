import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cursor-ink/30 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-cursor-card dark:bg-cursor-dark-card rounded-lg max-w-md w-full p-6 border border-cursor-hairline dark:border-cursor-dark-hairline relative">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-cursor-muted hover:text-cursor-ink dark:hover:text-cursor-dark-ink transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-[#cf2d56]/10 text-[#cf2d56] rounded-md border border-[#cf2d56]/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-normal text-cursor-ink dark:text-cursor-dark-ink tracking-editorial">{title}</h3>
            <p className="text-[11px] font-mono text-cursor-muted">Permanent deletion</p>
          </div>
        </div>

        <p className="text-xs text-cursor-body dark:text-cursor-dark-body mb-5 leading-relaxed">{message}</p>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-mono text-cursor-body dark:text-cursor-dark-body hover:bg-cursor-canvas dark:hover:bg-cursor-dark-canvas border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md transition disabled:opacity-40"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-1.5 text-xs font-medium text-white bg-[#cf2d56] hover:bg-[#b02244] rounded-md transition disabled:opacity-40"
          >
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
