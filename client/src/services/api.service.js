import axios from 'axios';

/**
 * Resolves the base API URL for either local server or a remote node
 */
export function getBaseApiUrl(customHost = null) {
  if (customHost) {
    return `${customHost.replace(/\/+$/, '')}/api`;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If accessing via LAN IP on Vite dev port 5173, point directly to backend port 3000
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && window.location.port === '5173') {
      return `http://${hostname}:3000/api`;
    }
  }

  return '/api';
}

export const apiService = {
  /**
   * Check health/liveness of a remote or local node
   */
  async checkHealth(customHost = null) {
    const url = `${getBaseApiUrl(customHost)}/health`;
    const res = await axios.get(url, { timeout: 4000 });
    return res.data;
  },

  /**
   * Fetch server information and disk stats
   */
  async getServerInfo(customHost = null) {
    const url = `${getBaseApiUrl(customHost)}/info`;
    const res = await axios.get(url, { timeout: 5000 });
    return res.data.data;
  },

  /**
   * Fetch file list from target server
   */
  async listFiles(customHost = null) {
    const url = `${getBaseApiUrl(customHost)}/files`;
    const res = await axios.get(url, { timeout: 8000 });
    return res.data.data || [];
  },

  /**
   * Upload a file with progress tracking
   */
  async uploadFile(file, onProgress = null, customHost = null) {
    const url = `${getBaseApiUrl(customHost)}/files`;
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted, progressEvent.loaded, progressEvent.total);
        }
      },
    });

    return res.data.data;
  },

  /**
   * Get direct download URL for a file
   */
  getDownloadUrl(fileId, customHost = null) {
    return `${getBaseApiUrl(customHost)}/files/${fileId}/download`;
  },

  /**
   * Trigger browser download of a file
   */
  async downloadFile(fileId, filename, customHost = null) {
    const url = this.getDownloadUrl(fileId, customHost);
    
    // Create an invisible anchor tag to trigger native streaming browser download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'download');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Delete a file by ID on target server
   */
  async deleteFile(fileId, customHost = null) {
    const url = `${getBaseApiUrl(customHost)}/files/${fileId}`;
    const res = await axios.delete(url);
    return res.data;
  },

  /**
   * Fetch discovered LAN peers
   */
  async getDiscoveredDevices(customHost = null) {
    try {
      const url = `${getBaseApiUrl(customHost)}/devices`;
      const res = await axios.get(url, { timeout: 3000 });
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Trigger active subnet scan
   */
  async scanNetwork(customHost = null) {
    try {
      const url = `${getBaseApiUrl(customHost)}/devices/scan`;
      const res = await axios.post(url, {}, { timeout: 15000 });
      return res.data.data || [];
    } catch {
      return [];
    }
  },
};

export default apiService;
