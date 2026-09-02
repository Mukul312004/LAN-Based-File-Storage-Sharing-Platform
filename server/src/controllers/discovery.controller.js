import discoveryService from '../discovery/discovery.service.js';
import clientTrackerService from '../services/client-tracker.service.js';

function extractClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const remote = req.socket?.remoteAddress || req.ip || '127.0.0.1';
  // Strip IPv6 prefix if IPv4-mapped (e.g. ::ffff:192.168.29.15 => 192.168.29.15)
  return remote.replace(/^::ffff:/, '');
}

export const getDiscoveredDevices = (req, res) => {
  const servers = discoveryService.getDiscoveredDevices();
  const clients = clientTrackerService.getAllClients();

  // Unified list of all active network peers & connected devices
  const allDevices = [...servers, ...clients];

  res.json({
    success: true,
    data: allDevices,
    servers,
    clients,
    count: allDevices.length,
  });
};

export const recordClientHeartbeat = (req, res) => {
  const { clientId, name, deviceType } = req.body;
  const ip = extractClientIp(req);
  const userAgent = req.headers['user-agent'] || '';

  if (!clientId) {
    return res.status(400).json({
      success: false,
      error: 'clientId is required',
    });
  }

  const client = clientTrackerService.recordHeartbeat({
    clientId,
    name,
    deviceType,
    ip,
    userAgent,
  });

  res.json({
    success: true,
    data: client,
  });
};

export const scanSubnet = async (req, res) => {
  try {
    const devices = await discoveryService.scanSubnet();
    const clients = clientTrackerService.getAllClients();
    res.json({
      success: true,
      message: 'Subnet scan completed',
      data: [...devices, ...clients],
      servers: devices,
      clients,
      count: devices.length + clients.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `Subnet scan failed: ${err.message}`,
    });
  }
};

export const addManualDevice = (req, res) => {
  const { host, port, name } = req.body;

  if (!host) {
    return res.status(400).json({
      success: false,
      error: 'Host IP address is required',
    });
  }

  const device = discoveryService.registerManualPeer({
    host: host.trim(),
    port: parseInt(port, 10) || 3000,
    name: name ? name.trim() : `Manual Node (${host})`,
  });

  res.status(201).json({
    success: true,
    message: 'Device added to peer registry',
    data: device,
  });
};

export const removeDevice = (req, res) => {
  const { id } = req.params;
  discoveryService.removePeer(id);
  clientTrackerService.removeClient(id);
  res.json({
    success: true,
    message: 'Device removed from registry',
  });
};

export const clearOfflineDevices = (req, res) => {
  discoveryService.clearOffline();
  clientTrackerService.clearOffline();
  res.json({
    success: true,
    message: 'Offline devices cleared',
  });
};
