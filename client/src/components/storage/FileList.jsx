import React from 'react';
import { FolderOpen, SearchX, Upload } from 'lucide-react';
import FileItem from './FileItem';

export default function FileList({
  files = [],
  loading,
  searchTerm,
  onDownload,
  onDelete,
  onOpenUpload,
  activeTarget,
}) {
  const filteredFiles = files.filter((f) =>
    f.originalName?.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  if (loading && files.length === 0) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-16 bg-slate-100 rounded-xl animate-pulse border border-slate-200"
          ></div>
        ))}
      </div>
    );
  }

  // Search produced 0 matches
  if (files.length > 0 && filteredFiles.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200">
        <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">
          No matching files found
        </h3>
        <p className="text-xs text-slate-500">
          No files match the search term &quot;{searchTerm}&quot;
        </p>
      </div>
    );
  }

  // Truly empty storage
  if (files.length === 0) {
    const isRemote = activeTarget !== null;
    return (
      <div className="text-center py-14 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          {isRemote ? 'No files on remote node' : 'Your storage is empty'}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
          {isRemote
            ? 'No files have been uploaded to this storage peer yet.'
            : 'Start storing and sharing files across your local network.'}
        </p>
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload First File</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {filteredFiles.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
