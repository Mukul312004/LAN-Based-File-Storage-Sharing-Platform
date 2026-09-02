import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ServerStatusCard from './components/dashboard/ServerStatusCard';
import StorageStatsCard from './components/dashboard/StorageStatsCard';
import DiscoveredDevicesCard from './components/dashboard/DiscoveredDevicesCard';
import StorageHeader from './components/storage/StorageHeader';
import FileList from './components/storage/FileList';
import FileUploadModal from './components/storage/FileUploadModal';
import ConfirmModal from './components/common/ConfirmModal';
import Toast from './components/common/Toast';
import apiService from './services/api.service';

export function App() {
  const [serverInfo, setServerInfo] = useState(null);
  const [files, setFiles] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null); // null means local server, or { name, host, port }
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const getTargetBaseUrl = useCallback(() => {
    return activeTarget ? `http://${activeTarget.host}:${activeTarget.port}` : null;
  }, [activeTarget]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Load local server info and storage metrics
  const loadServerInfo = useCallback(async () => {
    try {
      const targetUrl = getTargetBaseUrl();
      const info = await apiService.getServerInfo(targetUrl);
      setServerInfo(info);
    } catch (err) {
      console.error('Failed to load server info:', err);
      if (activeTarget) {
        showToast(`Could not connect to ${activeTarget.name || activeTarget.host}`, 'error');
      }
    }
  }, [getTargetBaseUrl, activeTarget]);

  // Load files for current active target
  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const targetUrl = getTargetBaseUrl();
      const fileList = await apiService.listFiles(targetUrl);
      setFiles(fileList);
    } catch (err) {
      console.error('Failed to load files:', err);
      showToast('Failed to fetch file list', 'error');
    } finally {
      setLoading(false);
    }
  }, [getTargetBaseUrl]);

  // Load discovered devices
  const loadDiscoveredDevices = useCallback(async () => {
    try {
      const devices = await apiService.getDiscoveredDevices();
      setDiscoveredDevices(devices);
    } catch (err) {
      console.warn('Failed to load discovered devices:', err);
    }
  }, []);

  // Full refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([loadServerInfo(), loadFiles(), loadDiscoveredDevices()]);
  }, [loadServerInfo, loadFiles, loadDiscoveredDevices]);

  // Initial load
  useEffect(() => {
    handleRefresh();
    // Periodic refresh for devices & stats every 8 seconds
    const interval = setInterval(() => {
      loadDiscoveredDevices();
      loadServerInfo();
    }, 8000);
    return () => clearInterval(interval);
  }, [handleRefresh, loadDiscoveredDevices, loadServerInfo]);

  // Handle uploading a file
  const handleUpload = async (file, onProgress) => {
    const targetUrl = getTargetBaseUrl();
    const uploaded = await apiService.uploadFile(file, onProgress, targetUrl);
    showToast(`"${uploaded.originalName}" uploaded successfully!`, 'success');
    await loadFiles();
    await loadServerInfo();
  };

  // Handle downloading a file
  const handleDownload = async (file) => {
    try {
      const targetUrl = getTargetBaseUrl();
      await apiService.downloadFile(file.id, file.originalName, targetUrl);
      showToast(`Downloading "${file.originalName}"...`, 'info');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Failed to download file', 'error');
    }
  };

  // Open delete confirmation
  const handleOpenDelete = (file) => {
    setFileToDelete(file);
  };

  // Execute file deletion
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setDeleting(true);
    try {
      const targetUrl = getTargetBaseUrl();
      await apiService.deleteFile(fileToDelete.id, targetUrl);
      showToast(`"${fileToDelete.originalName}" deleted successfully`, 'success');
      setFileToDelete(null);
      await loadFiles();
      await loadServerInfo();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete file', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Switch to a remote peer node
  const handleSelectDevice = (device) => {
    setActiveTarget(device);
    setSearchTerm('');
    showToast(`Switched storage view to "${device.name || device.host}"`, 'info');
  };

  // Reset view to local node
  const handleResetToLocal = () => {
    setActiveTarget(null);
    setSearchTerm('');
    showToast('Switched back to My Local Storage', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header */}
      <Header
        serverInfo={serverInfo}
        activeTarget={activeTarget}
        onResetToLocal={handleResetToLocal}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top 3 Dashboard Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ServerStatusCard
            serverInfo={serverInfo}
            activeTarget={activeTarget}
          />
          <StorageStatsCard
            storageStats={serverInfo?.storage}
            fileCount={files.length}
          />
          <DiscoveredDevicesCard
            devices={discoveredDevices}
            activeTarget={activeTarget}
            onSelectDevice={handleSelectDevice}
            onConnectManual={handleSelectDevice}
          />
        </div>

        {/* Main File Management Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
          <StorageHeader
            activeTarget={activeTarget}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onOpenUpload={() => setIsUploadOpen(true)}
            totalFiles={files.length}
          />

          <FileList
            files={files}
            loading={loading}
            searchTerm={searchTerm}
            onDownload={handleDownload}
            onDelete={handleOpenDelete}
            onOpenUpload={() => setIsUploadOpen(true)}
            activeTarget={activeTarget}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        activeTarget={activeTarget}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={fileToDelete !== null}
        title="Delete File"
        message={
          fileToDelete
            ? `Are you sure you want to delete "${fileToDelete.originalName}"? This will permanently remove the file from disk and database.`
            : ''
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setFileToDelete(null)}
        loading={deleting}
      />

      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
