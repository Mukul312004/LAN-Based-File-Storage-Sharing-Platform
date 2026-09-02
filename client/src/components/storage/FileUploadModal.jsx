import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export default function FileUploadModal({
  isOpen,
  onClose,
  onUpload,
  activeTarget,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await onUpload(selectedFile, (percent, loaded, total) => {
        setProgress(percent);
        setUploadedBytes(loaded);
        setTotalBytes(total);
      });
      // Reset & close on success
      setSelectedFile(null);
      setProgress(0);
      setUploading(false);
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || err.message || 'Failed to upload file');
      setUploading(false);
    }
  };

  const handleModalClose = () => {
    if (uploading) return; // Prevent closing mid-upload
    setSelectedFile(null);
    setProgress(0);
    setError(null);
    onClose();
  };

  const isRemote = activeTarget !== null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 relative animate-scale-in">
        <button
          onClick={handleModalClose}
          disabled={uploading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {isRemote ? `Upload to ${activeTarget.name || activeTarget.host}` : 'Upload File'}
          </h3>
          <p className="text-xs text-slate-500">
            Streaming directly to {isRemote ? 'remote peer storage' : 'local storage'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition ${
            dragActive
              ? 'border-blue-500 bg-blue-50/60'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-slate-800">
            Click to select or drag and drop
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports all file types (images, videos, documents, archives)
          </p>
        </div>

        {/* Selected file card */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate mr-2">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                <File className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
            </div>

            {!uploading && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Upload progress indicator */}
        {uploading && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {totalBytes > 0 && (
              <div className="text-[11px] text-slate-400 text-right">
                {formatBytes(uploadedBytes)} of {formatBytes(totalBytes)}
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleModalClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={!selectedFile || uploading}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition disabled:opacity-50 ${
              isRemote
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Streaming to Server...' : 'Start Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
