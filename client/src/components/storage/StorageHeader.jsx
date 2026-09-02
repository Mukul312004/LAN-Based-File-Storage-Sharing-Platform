import React from 'react';
import { Search, Upload, Folder, Laptop } from 'lucide-react';

export default function StorageHeader({
  activeTarget,
  searchTerm,
  onSearchChange,
  onOpenUpload,
  totalFiles,
}) {
  const isRemote = activeTarget !== null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cursor-hairline dark:border-cursor-dark-hairline">
      <div className="flex items-center space-x-3">
        <div className={`p-2.5 rounded-md border ${
          isRemote
            ? 'bg-[#dfa88f]/20 border-[#dfa88f]/40 text-cursor-orange'
            : 'bg-cursor-canvas-soft dark:bg-cursor-dark-canvas-soft border-cursor-hairline dark:border-cursor-dark-hairline text-cursor-ink dark:text-cursor-dark-ink'
        }`}>
          {isRemote ? <Laptop className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-normal text-cursor-ink dark:text-cursor-dark-ink tracking-editorial">
              {isRemote ? `Remote Storage: ${activeTarget.name || activeTarget.host}` : 'My Storage'}
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cursor-canvas dark:bg-cursor-dark-canvas border border-cursor-hairline dark:border-cursor-dark-hairline text-cursor-muted dark:text-cursor-dark-body">
              {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
            </span>
          </div>
          <p className="text-xs text-cursor-muted dark:text-cursor-dark-body font-mono">
            {isRemote
              ? `Files on ${activeTarget.host}:${activeTarget.port}`
              : 'Encapsulated local filesystem storage'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 w-full sm:w-auto">
        {/* Search input */}
        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-cursor-muted" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-cursor-card dark:bg-cursor-dark-card border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md text-sm text-cursor-ink dark:text-cursor-dark-ink placeholder:text-cursor-muted focus:border-cursor-orange transition"
          />
        </div>

        {/* Upload Action Button with Cursor Orange Brand CTA */}
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center space-x-2 px-4 py-2 font-medium text-sm rounded-md text-white bg-cursor-orange hover:bg-cursor-orange-active transition shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>
    </div>
  );
}
