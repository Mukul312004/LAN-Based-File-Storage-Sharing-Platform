import React from 'react';
import { Database, Files, HardDrive } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export default function StorageStatsCard({ storageStats, fileCount }) {
  const total = storageStats?.totalSpace || 100 * 1024 * 1024 * 1024;
  const used = storageStats?.usedSpace || storageStats?.appUsedSpace || 0;
  const free = storageStats?.freeSpace || Math.max(0, total - used);
  const percentUsed = Math.min(100, Math.max(0, Math.round((used / total) * 100))) || 1;
  const actualFileCount = typeof fileCount === 'number' ? fileCount : storageStats?.fileCount || 0;

  return (
    <div className="bg-cursor-card dark:bg-cursor-dark-card rounded-lg p-5 border border-cursor-hairline dark:border-cursor-dark-hairline transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cursor-canvas-soft dark:bg-cursor-dark-canvas-soft text-cursor-ink dark:text-cursor-dark-ink border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md">
            <Database className="w-4 h-4 text-cursor-orange" />
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-cursor-muted dark:text-cursor-dark-body">
              Storage Metrics
            </span>
            <h2 className="text-lg font-normal text-cursor-ink dark:text-cursor-dark-ink tracking-editorial">
              Disk Capacity
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-cursor-body dark:text-cursor-dark-body bg-cursor-canvas dark:bg-cursor-dark-canvas border border-cursor-hairline dark:border-cursor-dark-hairline px-2.5 py-0.5 rounded-full">
          <Files className="w-3 h-3 text-cursor-muted" />
          <span>{actualFileCount} {actualFileCount === 1 ? 'file' : 'files'}</span>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-cursor-hairline-soft dark:border-cursor-dark-hairline">
        <div>
          <div className="flex justify-between text-xs font-mono text-cursor-body dark:text-cursor-dark-body mb-1.5">
            <span>{formatBytes(used)} used</span>
            <span className="text-cursor-muted">{formatBytes(free)} free</span>
          </div>

          {/* Minimal hairline progress track */}
          <div className="w-full bg-cursor-canvas dark:bg-cursor-dark-canvas border border-cursor-hairline dark:border-cursor-dark-hairline rounded-full h-2 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed > 90
                  ? 'bg-[#cf2d56]'
                  : percentUsed > 75
                  ? 'bg-cursor-orange'
                  : 'bg-cursor-ink dark:bg-cursor-dark-ink'
              }`}
              style={{ width: `${percentUsed}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-cursor-muted dark:text-cursor-dark-body pt-1">
          <span className="flex items-center space-x-1">
            <HardDrive className="w-3 h-3 text-cursor-muted" />
            <span>Total: {formatBytes(total)}</span>
          </span>
          <span className="text-cursor-ink dark:text-cursor-dark-ink">{percentUsed}% utilized</span>
        </div>
      </div>
    </div>
  );
}
