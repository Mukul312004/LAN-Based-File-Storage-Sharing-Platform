import dgram from 'dgram';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config.js';
import { getPrimaryLanIp, getAllBroadcastDestinations, getNetworkAddresses } from '../utils/network.utils.js';
import fileService from '../services/file.service.js';
import storageService from '../services/storage.service.js';

const DISCOVERY_MAGIC = 'LAN_DFS_DISCOVERY_V1';
const MULTICAST_GROUP = '239.255.42.99';

class DiscoveryService {
  constructor() {
    this.nodeId = uuidv4();
    this.port = config.discovery.port;
    this.broadcastIntervalMs = config.discovery.broadcastInterval;
    this.peerTimeoutMs = config.discovery.peerTimeout;
    this.peers = new Map(); // id -> peer object
    this.manualPeers = new Map(); // id -> peer object
    this.socket = null;
    this.broadcastTimer = null;
    this.cleanupTimer = null;
    this.scanTimer = null;
    this.isRunning = false;
    this.isScanning = false;
  }

  /**
   * Start advertising this node and listening for LAN peers
   */
  startDiscovery() {
    if (this.isRunning) return;

    if (!config.discovery.enabled) {
      console.log('LAN Discovery is disabled via configuration.');
      return;
    }

    try {
      this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

      this.socket.on('error', (err) => {
        console.warn('Discovery socket warning:', err.message);
      });

      this.socket.on('message', (msg, rinfo) => {
        this.handleIncomingMessage(msg, rinfo);
      });

      this.socket.bind(this.port, '0.0.0.0', () => {
        try {
          this.socket.setBroadcast(true);
        } catch (e) {
          console.warn('Could not set socket broadcast flag:', e.message);
        }

        // Try joining multicast group for additional router compatibility
        try {
          this.socket.addMembership(MULTICAST_GROUP);
          this.socket.setMulticastTTL(4);
        } catch (e) {
          // Multicast might not be supported on all loopback adapters
        }

        console.log(`📡 LAN Discovery active on UDP port ${this.port} (Node ID: ${this.nodeId.substring(0, 8)})`);

        // Send initial broadcast immediately
        this.sendBroadcast();

        // Start periodic broadcaster
        this.broadcastTimer = setInterval(() => {
          this.sendBroadcast();
        }, this.broadcastIntervalMs);

        // Start periodic TTL cleanup
        this.cleanupTimer = setInterval(() => {
          this.evictStalePeers();
        }, Math.max(2000, Math.floor(this.peerTimeoutMs / 2)));

        // Run an initial quick background subnet sweep after 2 seconds
        setTimeout(() => {
          this.scanSubnet().catch(() => {});
        }, 2000);
      });

      this.isRunning = true;
    } catch (err) {
      console.error('Failed to initialize LAN discovery socket:', err);
    }
  }

  /**
   * Stop discovery and clean up sockets & timers
   */
  stopDiscovery() {
    if (!this.isRunning) return;

    if (this.broadcastTimer) {
      clearInterval(this.broadcastTimer);
      this.broadcastTimer = null;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    if (this.socket) {
      try {
        this.socket.close();
      } catch (err) {
        console.warn('Error closing discovery socket:', err.message);
      }
      this.socket = null;
    }

    this.isRunning = false;
    console.log('Discovery service stopped.');
  }

  /**
   * Build announcement payload
   */
  async buildAnnouncementPayload() {
    let storageSummary = null;
    try {
      const fileStats = await fileService.getFileStats();
      storageSummary = await storageService.getStorageStats(fileStats.count, fileStats.totalBytes);
    } catch {
      // Non-fatal if storage stats fail
    }

    return {
      magic: DISCOVERY_MAGIC,
      id: this.nodeId,
      name: config.serverName,
      host: getPrimaryLanIp(),
      port: config.port,
      storage: storageSummary,
      timestamp: Date.now(),
    };
  }

  /**
   * Broadcast presence to all LAN destinations (global, subnet broadcasts, and multicast)
   */
  async sendBroadcast() {
    if (!this.socket || !this.isRunning) return;

    try {
      const payload = await this.buildAnnouncementPayload();
      const message = Buffer.from(JSON.stringify(payload));
      const destinations = getAllBroadcastDestinations();

      // Send to all calculated subnet broadcast addresses (e.g. 192.168.29.255)
      for (const dest of destinations) {
        this.socket.send(message, 0, message.length, this.port, dest, () => {});
      }

      // Also send to multicast group
      try {
        this.socket.send(message, 0, message.length, this.port, MULTICAST_GROUP, () => {});
      } catch {}
    } catch (err) {
      console.warn('Error broadcasting presence beacon:', err.message);
    }
  }

  /**
   * Handle incoming UDP packet from another peer
   */
  handleIncomingMessage(msg, rinfo) {
    try {
      const data = JSON.parse(msg.toString('utf8'));

      // Validate discovery magic and filter out packets sent by ourself
      if (data.magic !== DISCOVERY_MAGIC || data.id === this.nodeId) {
        return;
      }

      const peerHost = data.host || rinfo.address;
      const peerPort = data.port || 3000;

      // Don't add if peerHost is identical to local IP and local port
      const primaryLan = getPrimaryLanIp();
      if (peerHost === primaryLan && peerPort === config.port) {
        return;
      }

      this.peers.set(data.id, {
        id: data.id,
        name: data.name || `Peer (${peerHost})`,
        host: peerHost,
        port: peerPort,
        storage: data.storage || null,
        lastSeen: Date.now(),
        status: 'online',
        type: 'auto',
      });
    } catch {
      // Ignore unparseable packets
    }
  }

  /**
   * Evict peers that haven't sent a heartbeat within peerTimeoutMs
   */
  evictStalePeers() {
    const now = Date.now();
    for (const [id, peer] of this.peers.entries()) {
      if (now - peer.lastSeen > this.peerTimeoutMs) {
        this.peers.delete(id);
      }
    }
  }

  /**
   * Active Subnet Scanner: Sweeps the local Wi-Fi /24 subnet for active storage nodes
   * Highly effective fallback when Wi-Fi router AP isolation blocks UDP broadcast
   */
  async scanSubnet(targetPort = config.port) {
    if (this.isScanning) return this.getDiscoveredDevices();
    this.isScanning = true;

    try {
      const primaryIp = getPrimaryLanIp();
      if (!primaryIp || primaryIp === '127.0.0.1') {
        this.isScanning = false;
        return this.getDiscoveredDevices();
      }

      const parts = primaryIp.split('.');
      if (parts.length !== 4) {
        this.isScanning = false;
        return this.getDiscoveredDevices();
      }

      const prefix = `${parts[0]}.${parts[1]}.${parts[2]}`;
      const localHostNumber = parseInt(parts[3], 10);

      // Probe all 254 subnet hosts concurrently with small batch size
      const hostsToScan = [];
      for (let i = 1; i <= 254; i++) {
        if (i !== localHostNumber) {
          hostsToScan.push(`${prefix}.${i}`);
        }
      }

      const probeHost = (ip) => {
        return new Promise((resolve) => {
          const req = http.get(
            `http://${ip}:${targetPort}/api/info`,
            { timeout: 600 },
            (res) => {
              if (res.statusCode === 200) {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.success && parsed.data) {
                      const nodeData = parsed.data;
                      const peerId = `scan-${ip}-${targetPort}`;
                      this.peers.set(peerId, {
                        id: peerId,
                        name: nodeData.serverName || `Node (${ip})`,
                        host: ip,
                        port: targetPort,
                        storage: nodeData.storage,
                        lastSeen: Date.now(),
                        status: 'online',
                        type: 'scan',
                      });
                      resolve(true);
                      return;
                    }
                  } catch {}
                  resolve(false);
                });
              } else {
                res.resume();
                resolve(false);
              }
            }
          );

          req.on('error', () => resolve(false));
          req.on('timeout', () => {
            req.destroy();
            resolve(false);
          });
        });
      };

      // Run probes in parallel batches of 35
      const batchSize = 35;
      for (let i = 0; i < hostsToScan.length; i += batchSize) {
        const batch = hostsToScan.slice(i, i + batchSize);
        await Promise.all(batch.map(probeHost));
      }
    } catch (err) {
      console.warn('Subnet scan encounter:', err.message);
    } finally {
      this.isScanning = false;
    }

    return this.getDiscoveredDevices();
  }

  /**
   * Register a manual peer (fallback if broadcast is blocked on network)
   */
  registerManualPeer(peer) {
    if (!peer || !peer.host) return null;
    const id = peer.id || `manual-${peer.host}-${peer.port || 3000}`;
    const manualPeer = {
      id,
      name: peer.name || `Manual Node (${peer.host})`,
      host: peer.host,
      port: peer.port || 3000,
      storage: peer.storage || null,
      lastSeen: Date.now(),
      status: 'online',
      type: 'manual',
    };
    this.manualPeers.set(id, manualPeer);
    return manualPeer;
  }

  /**
   * Get all active discovered peers + manual peers
   */
  getDiscoveredDevices() {
    this.evictStalePeers();

    const allPeers = [
      ...Array.from(this.peers.values()),
      ...Array.from(this.manualPeers.values()),
    ];

    return allPeers.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  }
}

export const discoveryService = new DiscoveryService();
export default discoveryService;
