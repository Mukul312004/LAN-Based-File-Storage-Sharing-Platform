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
      return <Image className="w-5 h-5 text-emerald-500" />;
    case 'video':
      return <Video className="w-5 h-5 text-purple-500" />;
    case 'audio':
      return <Music className="w-5 h-5 text-rose-500" />;
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'archive':
      return <Archive className="w-5 h-5 text-amber-500" />;
    case 'code':
      return <Code className="w-5 h-5 text-cyan-500" />;
    default:
      return <File className="w-5 h-5 text-blue-500" />;
  }
}

export default function FileItem({ file, onDownload, onDelete }) {
  const category = getFileTypeCategory(file.mimeType, file.originalName);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 hover:border-slate-300 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
      {/* File info */}
      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl shrink-0 group-hover:bg-slate-100 transition">
          {getFileIcon(category)}
        </div>

        <div className="min-w-0 flex-1">
          <h4
            className="text-sm font-bold text-slate-900 truncate"
            title={file.originalName}
          >
            {file.originalName}
          </h4>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
            <span className="font-medium text-slate-600">
              {formatBytes(file.fileSize)}
            </span>
            <span>•</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <button
          onClick={() => onDownload(file)}
          title="Download file"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>

        <button
          onClick={() => onDelete(file)}
          title="Delete file"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
