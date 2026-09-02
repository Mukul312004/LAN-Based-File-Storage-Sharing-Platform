import React from 'react';
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  File,
  Download,
  Trash2,
} from 'lucide-react';
import { formatBytes, formatDate, getFileTypeCategory } from '../../utils/formatters';

function getFileIcon(category) {
  switch (category) {
    case 'image':
      return <Image className="w-4 h-4 text-[#1f8a65] dark:text-[#9fc9a2]" />;
    case 'video':
      return <Video className="w-4 h-4 text-[#c0a8dd]" />;
    case 'audio':
      return <Music className="w-4 h-4 text-[#dfa88f]" />;
    case 'pdf':
      return <FileText className="w-4 h-4 text-[#cf2d56]" />;
    case 'archive':
      return <Archive className="w-4 h-4 text-[#c08532]" />;
    case 'code':
      return <Code className="w-4 h-4 text-[#9fbbe0]" />;
    default:
      return <File className="w-4 h-4 text-cursor-muted" />;
  }
}

export default function FileItem({ file, onDownload, onDelete }) {
  const category = getFileTypeCategory(file.mimeType, file.originalName);

  return (
    <div className="bg-cursor-card dark:bg-cursor-dark-card border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md p-3 hover:border-cursor-hairline-strong dark:hover:border-cursor-dark-hairline-strong transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
      {/* File info */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="p-2 bg-cursor-canvas dark:bg-cursor-dark-canvas border border-cursor-hairline dark:border-cursor-dark-hairline rounded shrink-0 group-hover:border-cursor-hairline-strong transition">
          {getFileIcon(category)}
        </div>

        <div className="min-w-0 flex-1">
          <h4
            className="text-sm font-normal text-cursor-ink dark:text-cursor-dark-ink truncate tracking-editorial"
            title={file.originalName}
          >
            {file.originalName}
          </h4>
          <div className="flex items-center space-x-2 text-xs font-mono text-cursor-muted dark:text-cursor-dark-body mt-0.5">
            <span>{formatBytes(file.fileSize)}</span>
            <span>•</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-cursor-hairline-soft dark:border-cursor-dark-hairline">
        <button
          onClick={() => onDownload(file)}
          title="Download file"
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-cursor-canvas dark:bg-cursor-dark-canvas hover:bg-cursor-canvas-soft dark:hover:bg-cursor-dark-card text-cursor-ink dark:text-cursor-dark-ink border border-cursor-hairline-strong dark:border-cursor-dark-hairline rounded text-xs font-mono transition"
        >
          <Download className="w-3 h-3 text-cursor-muted" />
          <span>Download</span>
        </button>

        <button
          onClick={() => onDelete(file)}
          title="Delete file"
          className="p-1.5 text-cursor-muted hover:text-[#cf2d56] hover:bg-cursor-canvas dark:hover:bg-cursor-dark-canvas rounded transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
