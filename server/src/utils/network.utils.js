import os from 'os';

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
        addresses.push({
          interface: name,
          address: iface.address,
          netmask: iface.netmask,
        });
      }
    }
  }

  return addresses;
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
