class ClientTrackerService {
  constructor() {
    this.clients = new Map(); // clientId -> { clientId, name, deviceType, ip, userAgent, lastSeen, status }
    this.clientTimeoutMs = 30000; // 30 seconds active timeout (prevents mobile background throttling drops)
    this.retentionMs = 24 * 60 * 60 * 1000; // Keep offline device history for 24 hours
  }

  /**
   * Register or refresh heartbeat from a connected browser/client
   */
  recordHeartbeat({ clientId, name, deviceType, ip, userAgent }) {
    if (!clientId) return null;

    const existing = this.clients.get(clientId);
    const clientRecord = {
      id: clientId,
      name: name || existing?.name || 'Connected Device',
      deviceType: deviceType || existing?.deviceType || 'mobile',
      ip: ip || existing?.ip || '127.0.0.1',
      userAgent: userAgent || existing?.userAgent || '',
      lastSeen: Date.now(),
      status: 'active',
      type: 'client',
    };

    this.clients.set(clientId, clientRecord);
    return clientRecord;
  }

  /**
   * Update active/offline status based on recency and purge very old history
   */
  updateClientStatuses() {
    const now = Date.now();
    for (const [id, client] of this.clients.entries()) {
      const elapsed = now - client.lastSeen;
      if (elapsed > this.retentionMs) {
        this.clients.delete(id);
      } else if (elapsed > this.clientTimeoutMs) {
        client.status = 'offline';
      } else {
        client.status = 'active';
      }
    }
  }

  /**
   * Get all connected clients (both active and recently disconnected)
   */
  getAllClients() {
    this.updateClientStatuses();
    return Array.from(this.clients.values()).sort((a, b) => {
      // Active first, then by lastSeen recency
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return b.lastSeen - a.lastSeen;
    });
  }

  /**
   * Remove a specific client from history
   */
  removeClient(clientId) {
    return this.clients.delete(clientId);
  }

  /**
   * Clear all offline clients
   */
  clearOffline() {
    for (const [id, client] of this.clients.entries()) {
      if (client.status === 'offline') {
        this.clients.delete(id);
      }
    }
  }
}

export const clientTrackerService = new ClientTrackerService();
export default clientTrackerService;
