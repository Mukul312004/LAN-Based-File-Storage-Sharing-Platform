import React from 'react';
import { Search, Upload, Folder, HardDrive, Laptop } from 'lucide-react';

export default function StorageHeader({
  activeTarget,
  searchTerm,
  onSearchChange,
  onOpenUpload,
  totalFiles,
}) {
  const isRemote = activeTarget !== null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div className="flex items-center space-x-3">
        <div className={`p-2.5 rounded-xl ${isRemote ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
          {isRemote ? <Laptop className="w-6 h-6" /> : <Folder className="w-6 h-6" />}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">
              {isRemote ? `Remote Storage: ${activeTarget.name || activeTarget.host}` : 'My Storage'}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isRemote
              ? `Browsing files stored on ${activeTarget.host}:${activeTarget.port}`
              : 'Files stored locally on this machine'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 w-full sm:w-auto">
        {/* Search input */}
        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Upload Action Button */}
        <button
          onClick={onOpenUpload}
          className={`inline-flex items-center space-x-2 px-4 py-2 font-semibold text-sm rounded-xl text-white shadow-sm transition shrink-0 ${
            isRemote
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>
    </div>
  );
}
