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
import { detectDeviceInfo } from './utils/device';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export function App() {
  const [deviceInfo] = useState(() => detectDeviceInfo());
  const [localServerInfo, setLocalServerInfo] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const [files, setFiles] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null); // null means local server, or { id, name, host, port }
  const [loading, setLoading] = useState(false);
  const [remoteError, setRemoteError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('lan_dfs_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync dark mode class on <html> element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lan_dfs_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lan_dfs_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const getTargetBaseUrl = useCallback(() => {
    return activeTarget ? `http://${activeTarget.host}:${activeTarget.port}` : null;
  }, [activeTarget]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Load server info (local or remote)
  const loadServerInfo = useCallback(async () => {
    try {
      const targetUrl = getTargetBaseUrl();
      const info = await apiService.getServerInfo(targetUrl);
      setServerInfo(info);
      if (!activeTarget) {
        setLocalServerInfo(info);
      }
      setRemoteError(null);
    } catch (err) {
      console.error('Failed to load server info:', err);
      if (activeTarget) {
        setRemoteError(`Unable to communicate with ${activeTarget.name || activeTarget.host}:${activeTarget.port}`);
      }
    }
  }, [getTargetBaseUrl, activeTarget]);

  // Load files for current active target (local or remote)
  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const targetUrl = getTargetBaseUrl();
      const fileList = await apiService.listFiles(targetUrl);
      setFiles(fileList);
      setRemoteError(null);
    } catch (err) {
      console.error('Failed to load files:', err);
      if (activeTarget) {
        setRemoteError(`Failed to fetch file list from ${activeTarget.name || activeTarget.host}`);
      } else {
        showToast('Failed to fetch local file list', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [getTargetBaseUrl, activeTarget]);

  // Load discovered LAN peers & connected clients
  const loadDiscoveredDevices = useCallback(async () => {
    try {
      const devices = await apiService.getDiscoveredDevices();
      setDiscoveredDevices(devices);
    } catch (err) {
      console.warn('Failed to load discovered devices:', err);
    }
  }, []);

  // Send client heartbeat to announce presence to server
  const sendDeviceHeartbeat = useCallback(async () => {
    try {
      await apiService.sendHeartbeat(deviceInfo);
    } catch {
      // Non-fatal
    }
  }, [deviceInfo]);

  // Full refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([loadServerInfo(), loadFiles(), loadDiscoveredDevices()]);
  }, [loadServerInfo, loadFiles, loadDiscoveredDevices]);

  // Trigger load when target server changes
  useEffect(() => {
    handleRefresh();
  }, [activeTarget, handleRefresh]);

  // Periodic polling for discovery & stats + robust mobile heartbeat
  useEffect(() => {
    sendDeviceHeartbeat();
    const interval = setInterval(() => {
      sendDeviceHeartbeat();
      loadDiscoveredDevices();
      if (!remoteError) {
        loadServerInfo();
      }
    }, 3000);

    const handleWakeup = () => {
      sendDeviceHeartbeat();
      loadDiscoveredDevices();
    };

    window.addEventListener('visibilitychange', handleWakeup);
    window.addEventListener('focus', handleWakeup);
    window.addEventListener('online', handleWakeup);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleWakeup);
      window.removeEventListener('focus', handleWakeup);
      window.removeEventListener('online', handleWakeup);
    };
  }, [sendDeviceHeartbeat, loadDiscoveredDevices, loadServerInfo, remoteError]);

  // Handle uploading a file (to local or remote target)
  const handleUpload = async (file, onProgress) => {
    const targetUrl = getTargetBaseUrl();
    const uploaded = await apiService.uploadFile(file, onProgress, targetUrl);
    showToast(
      `"${uploaded.originalName}" uploaded to ${activeTarget ? activeTarget.name || activeTarget.host : 'My Storage'}!`,
      'success'
    );
    await loadFiles();
    await loadServerInfo();
  };

  // Handle downloading a file (from local or remote target)
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

  // Execute file deletion (on local or remote target)
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
    setRemoteError(null);
    setActiveTarget(device);
    setSearchTerm('');
    showToast(`Connecting to "${device.name || device.host}"...`, 'info');
  };

  // Reset view to local node
  const handleResetToLocal = () => {
    setRemoteError(null);
    setActiveTarget(null);
    setSearchTerm('');
    showToast('Switched back to My Local Storage', 'info');
  };

  const [isScanning, setIsScanning] = useState(false);

  // Trigger active network scan
  const handleScanNetwork = async () => {
    setIsScanning(true);
    showToast('Scanning local Wi-Fi subnet for active storage peers...', 'info');
    try {
      const scannedDevices = await apiService.scanNetwork();
      setDiscoveredDevices(scannedDevices);
      if (scannedDevices.length > 0) {
        showToast(`Found ${scannedDevices.length} storage node(s) on Wi-Fi!`, 'success');
      } else {
        showToast('Subnet scan complete. No other nodes found on this subnet.', 'info');
      }
    } catch (err) {
      console.warn('Scan error:', err);
      showToast('Scan completed.', 'info');
    } finally {
      setIsScanning(false);
    }
  };

  // Clear all offline devices from history
  const handleClearOffline = async () => {
    await apiService.clearOfflineDevices();
    await loadDiscoveredDevices();
    showToast('Cleared disconnected device history', 'info');
  };

  // Remove a single device from history
  const handleRemoveDevice = async (id) => {
    await apiService.removeDevice(id);
    await loadDiscoveredDevices();
    showToast('Device removed from list', 'info');
  };

  return (
    <div className="min-h-screen bg-cursor-canvas dark:bg-cursor-dark-canvas text-cursor-ink dark:text-cursor-dark-ink flex flex-col transition-colors">
      {/* Top Header */}
      <Header
        serverInfo={serverInfo || localServerInfo}
        activeTarget={activeTarget}
        onResetToLocal={handleResetToLocal}
        onRefresh={handleRefresh}
        loading={loading}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
        {/* Remote Connection Error Alert */}
        {remoteError && (
          <div className="p-3.5 bg-[#cf2d56]/10 border border-[#cf2d56]/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#cf2d56] text-xs font-mono">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-[#cf2d56] shrink-0" />
              <div>
                <p className="font-medium">Remote Connection Error</p>
                <p className="text-[11px] opacity-90">{remoteError}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-cursor-card dark:bg-cursor-dark-card hover:bg-cursor-canvas dark:hover:bg-cursor-dark-canvas border border-cursor-hairline dark:border-cursor-dark-hairline rounded text-xs transition"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
              <button
                onClick={handleResetToLocal}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#cf2d56] hover:bg-[#b02244] text-white rounded text-xs transition font-medium"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Return to Local</span>
              </button>
            </div>
          </div>
        )}

        {/* Top 3 Dashboard Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ServerStatusCard
            serverInfo={serverInfo || localServerInfo}
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
            onScanNetwork={handleScanNetwork}
            onClearOffline={handleClearOffline}
            onRemoveDevice={handleRemoveDevice}
            isScanning={isScanning}
            currentDeviceId={deviceInfo.id}
          />
        </div>

        {/* Main File Management Panel */}
        <div className="bg-cursor-card dark:bg-cursor-dark-card rounded-lg border border-cursor-hairline dark:border-cursor-dark-hairline p-5 sm:p-6 space-y-4 transition-colors">
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
            ? `Are you sure you want to delete "${fileToDelete.originalName}"? This will permanently remove the file from ${
                activeTarget ? activeTarget.name || activeTarget.host : 'local storage'
              }.`
            : ''
        }
        confirmText="Delete"
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
