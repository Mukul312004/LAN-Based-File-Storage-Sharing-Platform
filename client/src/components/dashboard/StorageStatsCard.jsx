import React from 'react';
import { PieChart, Files, Database, HardDrive } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export default function StorageStatsCard({ storageStats, fileCount }) {
  const total = storageStats?.totalSpace || 100 * 1024 * 1024 * 1024;
  const used = storageStats?.usedSpace || storageStats?.appUsedSpace || 0;
  const free = storageStats?.freeSpace || Math.max(0, total - used);
  const percentUsed = Math.min(100, Math.max(0, Math.round((used / total) * 100))) || 1;
  const actualFileCount = typeof fileCount === 'number' ? fileCount : storageStats?.fileCount || 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Storage Metrics
            </span>
            <h2 className="text-lg font-bold text-slate-900">Disk Capacity</h2>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
          <Files className="w-3.5 h-3.5 text-slate-500" />
          <span>{actualFileCount} {actualFileCount === 1 ? 'file' : 'files'}</span>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span>{formatBytes(used)} used</span>
            <span className="text-slate-500">{formatBytes(free)} available</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                percentUsed > 90
                  ? 'bg-rose-500'
                  : percentUsed > 75
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${percentUsed}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span className="flex items-center space-x-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Total: {formatBytes(total)}</span>
          </span>
          <span className="font-semibold text-slate-700">{percentUsed}% utilized</span>
        </div>
      </div>
    </div>
  );
}
