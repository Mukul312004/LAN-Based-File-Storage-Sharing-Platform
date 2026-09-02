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
      <div className="space-y-2 py-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-14 bg-cursor-canvas-soft dark:bg-cursor-dark-canvas rounded-md animate-pulse border border-cursor-hairline dark:border-cursor-dark-hairline"
          ></div>
        ))}
      </div>
    );
  }

  // Search produced 0 matches
  if (files.length > 0 && filteredFiles.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-cursor-canvas dark:bg-cursor-dark-canvas rounded-lg border border-cursor-hairline dark:border-cursor-dark-hairline">
        <SearchX className="w-8 h-8 text-cursor-muted mx-auto mb-2 opacity-50" />
        <h3 className="text-sm font-normal text-cursor-ink dark:text-cursor-dark-ink mb-1">
          No matching files found
        </h3>
        <p className="text-xs font-mono text-cursor-muted">
          No results for &quot;{searchTerm}&quot;
        </p>
      </div>
    );
  }

  // Empty storage
  if (files.length === 0) {
    const isRemote = activeTarget !== null;
    return (
      <div className="text-center py-14 px-4 bg-cursor-canvas dark:bg-cursor-dark-canvas rounded-lg border border-dashed border-cursor-hairline-strong dark:border-cursor-dark-hairline">
        <div className="w-12 h-12 bg-cursor-card dark:bg-cursor-dark-card border border-cursor-hairline dark:border-cursor-dark-hairline text-cursor-orange rounded-md flex items-center justify-center mx-auto mb-3">
          <FolderOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-normal text-cursor-ink dark:text-cursor-dark-ink mb-1 tracking-editorial">
          {isRemote ? 'No files on remote node' : 'Storage is empty'}
        </h3>
        <p className="text-xs text-cursor-muted max-w-sm mx-auto mb-5">
          {isRemote
            ? 'No files have been uploaded to this storage peer yet.'
            : 'Start storing and sharing files across your local network.'}
        </p>
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-cursor-orange hover:bg-cursor-orange-active text-white text-xs font-medium rounded-md transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload First File</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
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
