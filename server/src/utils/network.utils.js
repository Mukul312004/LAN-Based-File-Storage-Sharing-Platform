import os from 'os';

/**
 * Calculates the subnet broadcast address for a given IPv4 and netmask
 * e.g., 192.168.29.17 + 255.255.255.0 => 192.168.29.255
 */
export function calculateBroadcastAddress(ip, netmask) {
  if (!ip || !netmask) return null;
  const ipParts = ip.split('.').map(Number);
  const maskParts = netmask.split('.').map(Number);
  if (ipParts.length !== 4 || maskParts.length !== 4) return null;

  const broadcastParts = [];
  for (let i = 0; i < 4; i++) {
    broadcastParts.push((ipParts[i] & maskParts[i]) | (~maskParts[i] & 255));
  }
  return broadcastParts.join('.');
}

/**
 * Get all available IPv4 addresses across network interfaces
 * prioritizing typical LAN subnets (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
 */
export function getNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Filter out internal/loopback and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        const broadcast = calculateBroadcastAddress(iface.address, iface.netmask);
        addresses.push({
          interface: name,
          address: iface.address,
          netmask: iface.netmask,
          broadcast,
        });
      }
    }
  }

  return addresses;
}

/**
 * Get all unique broadcast destinations across all network interfaces
 */
export function getAllBroadcastDestinations() {
  const destinations = new Set(['255.255.255.255']);
  const ifaces = getNetworkAddresses();

  for (const iface of ifaces) {
    if (iface.broadcast) {
      destinations.add(iface.broadcast);
    }
  }

  return Array.from(destinations);
}

/**
 * Get the primary LAN IP address to advertise and display
 */
export function getPrimaryLanIp() {
  const addresses = getNetworkAddresses();
  if (addresses.length === 0) {
    return '127.0.0.1';
  }

  // Prioritize 192.168.x.x or 10.x.x.x (common Wi-Fi / Ethernet subnets)
  const wifiOrEthernet = addresses.find(
    (a) =>
      a.address.startsWith('192.168.') ||
      a.address.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(a.address)
  );

  return wifiOrEthernet ? wifiOrEthernet.address : addresses[0].address;
}
