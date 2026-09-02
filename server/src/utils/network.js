import os from 'os';

/**
 * Automatically determine the primary LAN IPv4 address of the machine.
 * Skips internal loopbacks (127.0.0.1) and prioritizes standard Wi-Fi / Ethernet subnets.
 *
 * @returns {string} The local network IPv4 address, or '127.0.0.1' fallback.
 */
export function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const candidateAddresses = [];

  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (!networkInterface) continue;

    for (const iface of networkInterface) {
      // Must be IPv4 and not internal loopback
      if (iface.family === 'IPv4' && !iface.internal) {
        // Exclude common virtual network adapters if possible
        const isVirtual = /vEthernet|Virtual|VMware|VirtualBox|WSL|Loopback/i.test(name);
        if (!isVirtual) {
          return iface.address;
        }
        candidateAddresses.push(iface.address);
      }
    }
  }

  // Fallback to first non-internal candidate, or 127.0.0.1
  return candidateAddresses[0] || '127.0.0.1';
}
