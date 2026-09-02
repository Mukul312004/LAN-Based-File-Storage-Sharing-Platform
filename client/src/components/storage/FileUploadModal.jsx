import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';
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
    if (uploading) return;
    setSelectedFile(null);
    setProgress(0);
    setError(null);
    onClose();
  };

  const isRemote = activeTarget !== null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cursor-ink/30 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-cursor-card dark:bg-cursor-dark-card rounded-lg max-w-lg w-full p-6 border border-cursor-hairline dark:border-cursor-dark-hairline relative">
        <button
          onClick={handleModalClose}
          disabled={uploading}
          className="absolute top-4 right-4 text-cursor-muted hover:text-cursor-ink dark:hover:text-cursor-dark-ink transition disabled:opacity-30"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <h3 className="text-base font-normal text-cursor-ink dark:text-cursor-dark-ink tracking-editorial">
            {isRemote ? `Upload to ${activeTarget.name || activeTarget.host}` : 'Upload File'}
          </h3>
          <p className="text-xs text-cursor-muted font-mono">
            Streaming to {isRemote ? 'remote peer storage' : 'local storage'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-[#cf2d56]/10 border border-[#cf2d56]/30 text-[#cf2d56] rounded-md text-xs flex items-center space-x-2 font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
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
          className={`border border-dashed rounded-md p-6 sm:p-8 text-center cursor-pointer transition ${
            dragActive
              ? 'border-cursor-orange bg-cursor-orange/5'
              : 'border-cursor-hairline-strong dark:border-cursor-dark-hairline hover:border-cursor-orange bg-cursor-canvas dark:bg-cursor-dark-canvas'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          <div className="w-10 h-10 bg-cursor-card dark:bg-cursor-dark-card border border-cursor-hairline dark:border-cursor-dark-hairline text-cursor-orange rounded-md flex items-center justify-center mx-auto mb-2.5">
            <UploadCloud className="w-5 h-5" />
          </div>

          <p className="text-xs font-medium text-cursor-ink dark:text-cursor-dark-ink">
            Click to select or drag and drop file
          </p>
          <p className="text-[11px] font-mono text-cursor-muted mt-1">
            Documents, photos, media & archives
          </p>
        </div>

        {/* Selected file card */}
        {selectedFile && (
          <div className="mt-3 p-2.5 bg-cursor-canvas dark:bg-cursor-dark-canvas border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md flex items-center justify-between font-mono">
            <div className="flex items-center space-x-2.5 truncate mr-2">
              <div className="p-1.5 bg-cursor-card dark:bg-cursor-dark-card rounded border border-cursor-hairline dark:border-cursor-dark-hairline text-cursor-muted">
                <File className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-xs text-cursor-ink dark:text-cursor-dark-ink truncate font-normal">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-cursor-muted">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
            </div>

            {!uploading && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-cursor-muted hover:text-cursor-ink dark:hover:text-cursor-dark-ink p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Upload progress indicator */}
        {uploading && (
          <div className="mt-3 space-y-1 font-mono">
            <div className="flex justify-between text-xs text-cursor-body dark:text-cursor-dark-body">
              <span>Streaming...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-cursor-canvas dark:bg-cursor-dark-canvas border border-cursor-hairline dark:border-cursor-dark-hairline rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cursor-orange h-full rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {totalBytes > 0 && (
              <div className="text-[10px] text-cursor-muted text-right">
                {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-5 flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleModalClose}
            disabled={uploading}
            className="px-3.5 py-1.5 text-xs font-mono text-cursor-body dark:text-cursor-dark-body hover:bg-cursor-canvas dark:hover:bg-cursor-dark-canvas rounded-md border border-cursor-hairline dark:border-cursor-dark-hairline transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={!selectedFile || uploading}
            className="px-4 py-1.5 text-xs font-medium text-white bg-cursor-orange hover:bg-cursor-orange-active rounded-md transition disabled:opacity-40"
          >
            {uploading ? 'Streaming...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
