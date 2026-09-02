import discoveryService from '../discovery/discovery.service.js';

export const getDiscoveredDevices = (req, res) => {
  const devices = discoveryService.getDiscoveredDevices();
  res.json({
    success: true,
    data: devices,
    count: devices.length,
  });
};

export const scanSubnet = async (req, res) => {
  try {
    const devices = await discoveryService.scanSubnet();
    res.json({
      success: true,
      message: 'Subnet scan completed',
      data: devices,
      count: devices.length,
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
