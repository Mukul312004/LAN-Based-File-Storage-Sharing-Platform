import React, { useState } from 'react';
import {
  Wifi,
  Radio,
  Laptop,
  Smartphone,
  Tablet,
  ArrowRight,
  Plus,
  CheckCircle,
  RefreshCw,
  Server,
  Trash2,
} from 'lucide-react';

function getDeviceIcon(device) {
  if (device.deviceType === 'phone' || /phone|android|iphone/i.test(device.name)) {
    return <Smartphone className="w-4 h-4 text-[#1f8a65] dark:text-[#9fc9a2]" />;
  }
  if (device.deviceType === 'tablet' || /tablet|ipad/i.test(device.name)) {
    return <Tablet className="w-4 h-4 text-[#c0a8dd]" />;
  }
  if (device.type === 'client') {
    return <Laptop className="w-4 h-4 text-[#9fbbe0]" />;
  }
  return <Server className="w-4 h-4 text-cursor-orange" />;
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'recently';
  const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
  if (elapsedSeconds < 20) return 'just now';
  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function DiscoveredDevicesCard({
  devices = [],
  activeTarget,
  onSelectDevice,
  onConnectManual,
  onScanNetwork,
  onClearOffline,
  onRemoveDevice,
  isScanning,
  currentDeviceId,
}) {
  const [manualIp, setManualIp] = useState('');
  const [manualPort, setManualPort] = useState('3000');
  const [showManual, setShowManual] = useState(false);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualIp.trim()) return;
    onConnectManual({
      id: `manual-${Date.now()}`,
      name: `Node (${manualIp.trim()})`,
      host: manualIp.trim(),
      port: parseInt(manualPort, 10) || 3000,
      status: 'online',
    });
    setManualIp('');
    setShowManual(false);
  };

  // Filter out self
  const visibleDevices = devices.filter((d) => d.id !== currentDeviceId);
  const activeDevices = visibleDevices.filter((d) => d.status === 'active' || d.status === 'online');
  const offlineDevices = visibleDevices.filter((d) => d.status === 'offline');

  return (
    <div className="bg-cursor-card dark:bg-cursor-dark-card rounded-lg p-5 border border-cursor-hairline dark:border-cursor-dark-hairline transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cursor-canvas-soft dark:bg-cursor-dark-canvas-soft text-cursor-ink dark:text-cursor-dark-ink border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md">
              <Radio className={`w-4 h-4 ${isScanning ? 'animate-spin text-cursor-orange' : 'text-[#1f8a65] dark:text-[#9fc9a2]'}`} />
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-cursor-muted dark:text-cursor-dark-body">
                LAN Discovery
              </span>
              <h2 className="text-lg font-normal text-cursor-ink dark:text-cursor-dark-ink tracking-editorial">
                Connected Peers
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onScanNetwork}
              disabled={isScanning}
              title="Perform active subnet scan"
              className="text-xs text-cursor-muted hover:text-cursor-ink dark:hover:text-cursor-dark-ink font-mono flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-cursor-canvas-soft dark:hover:bg-cursor-dark-canvas-soft border border-cursor-hairline dark:border-cursor-dark-hairline transition disabled:opacity-40"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-cursor-orange' : ''}`} />
              <span>{isScanning ? 'Scanning' : 'Scan'}</span>
            </button>

            <button
              onClick={() => setShowManual(!showManual)}
              className="text-xs text-cursor-ink dark:text-cursor-dark-ink hover:text-cursor-orange font-medium flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-cursor-canvas-soft dark:hover:bg-cursor-dark-canvas-soft border border-cursor-hairline dark:border-cursor-dark-hairline transition"
            >
              <Plus className="w-3 h-3" />
              <span>Manual</span>
            </button>
          </div>
        </div>

        {showManual && (
          <form onSubmit={handleManualSubmit} className="mb-4 p-3 bg-cursor-canvas dark:bg-cursor-dark-canvas border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md text-xs space-y-2">
            <div className="font-normal text-cursor-ink dark:text-cursor-dark-ink">Connect to Node by IP</div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. 192.168.29.15"
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-cursor-card dark:bg-cursor-dark-card border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md text-xs font-mono text-cursor-ink dark:text-cursor-dark-ink focus:border-cursor-orange"
                required
              />
              <input
                type="number"
                placeholder="3000"
                value={manualPort}
                onChange={(e) => setManualPort(e.target.value)}
                className="w-16 px-2 py-1.5 bg-cursor-card dark:bg-cursor-dark-card border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md text-xs font-mono text-cursor-ink dark:text-cursor-dark-ink focus:border-cursor-orange"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-cursor-orange hover:bg-cursor-orange-active text-white rounded-md font-medium transition shrink-0"
              >
                Connect
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2 pt-3 border-t border-cursor-hairline-soft dark:border-cursor-dark-hairline max-h-56 overflow-y-auto">
          {visibleDevices.length === 0 ? (
            <div className="text-center py-5 px-2 text-cursor-muted text-xs">
              <Wifi className="w-5 h-5 mx-auto mb-1.5 opacity-40 animate-pulse" />
              <p>{isScanning ? 'Probing Wi-Fi subnet...' : 'No other devices active on LAN'}</p>
              <p className="text-[10px] text-cursor-muted/80 mt-1 font-mono">
                Open <strong>http://192.168.29.17:3000</strong> on phone
              </p>
            </div>
          ) : (
            <>
              {/* Online / Active Devices */}
              {activeDevices.map((device) => {
                const isClient = device.type === 'client';
                const isCurrentActive = activeTarget?.host === device.host && activeTarget?.port === device.port;

                return (
                  <div
                    key={device.id || `${device.host || device.ip}:${device.port || 'client'}`}
                    className={`p-2.5 rounded-md border flex items-center justify-between transition ${
                      isCurrentActive
                        ? 'bg-cursor-orange/10 border-cursor-orange/40'
                        : isClient
                        ? 'bg-[#9fc9a2]/10 border-[#9fc9a2]/30'
                        : 'bg-cursor-canvas dark:bg-cursor-dark-canvas border-cursor-hairline dark:border-cursor-dark-hairline'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate mr-2">
                      <div className="p-1.5 bg-cursor-card dark:bg-cursor-dark-card rounded border border-cursor-hairline dark:border-cursor-dark-hairline shrink-0">
                        {getDeviceIcon(device)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-normal text-cursor-ink dark:text-cursor-dark-ink truncate flex items-center space-x-1.5">
                          <span>{device.name || (isClient ? 'Connected Device' : 'Storage Peer')}</span>
                          {isClient && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#9fc9a2]/25 text-[#1f8a65] dark:text-[#9fc9a2] font-mono rounded">
                              Client
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-cursor-muted font-mono">
                          {device.host ? `${device.host}:${device.port}` : `${device.ip || 'LAN Client'}`}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isClient ? (
                        <span className="inline-flex items-center text-[10px] font-mono text-[#1f8a65] dark:text-[#9fc9a2] px-2 py-0.5 bg-[#9fc9a2]/20 rounded-full">
                          <span className="w-1.5 h-1.5 mr-1 bg-[#1f8a65] dark:bg-[#9fc9a2] rounded-full animate-pulse"></span>
                          Active
                        </span>
                      ) : isCurrentActive ? (
                        <span className="inline-flex items-center text-xs text-cursor-orange font-medium px-2 py-0.5 bg-cursor-orange/15 rounded">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectDevice(device)}
                          className="inline-flex items-center text-xs font-medium px-2.5 py-1 bg-cursor-card dark:bg-cursor-dark-card hover:bg-cursor-canvas-soft dark:hover:bg-cursor-dark-canvas text-cursor-ink dark:text-cursor-dark-ink border border-cursor-hairline-strong dark:border-cursor-dark-hairline rounded transition"
                        >
                          <span>Connect</span>
                          <ArrowRight className="w-3 h-3 ml-1 text-cursor-muted" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Offline / Previously Connected Devices */}
              {offlineDevices.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-cursor-muted mb-1.5 px-1">
                    <span>DISCONNECTED PEERS</span>
                    <button
                      onClick={onClearOffline}
                      className="text-cursor-muted hover:text-cursor-ink dark:hover:text-cursor-dark-ink hover:underline"
                    >
                      Clear
                    </button>
                  </div>

                  {offlineDevices.map((device) => {
                    return (
                      <div
                        key={device.id || `${device.host || device.ip}:${device.port || 'offline'}`}
                        className="p-2 mb-1.5 rounded-md border border-cursor-hairline dark:border-cursor-dark-hairline bg-cursor-canvas/60 dark:bg-cursor-dark-canvas/60 opacity-70 hover:opacity-100 transition flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 truncate mr-2">
                          <div className="p-1 bg-cursor-card dark:bg-cursor-dark-card rounded text-cursor-muted">
                            {getDeviceIcon(device)}
                          </div>
                          <div className="truncate">
                            <div className="text-xs text-cursor-body dark:text-cursor-dark-body truncate">
                              {device.name}
                            </div>
                            <div className="text-[10px] font-mono text-cursor-muted">
                              Offline • {formatTimeAgo(device.lastSeen)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          {device.host && (
                            <button
                              onClick={() => onSelectDevice(device)}
                              title="Attempt to reconnect to this device"
                              className="text-[11px] font-mono px-2 py-0.5 bg-cursor-card dark:bg-cursor-dark-card hover:bg-cursor-canvas-soft dark:hover:bg-cursor-dark-canvas text-cursor-ink dark:text-cursor-dark-ink border border-cursor-hairline dark:border-cursor-dark-hairline rounded transition"
                            >
                              Reconnect
                            </button>
                          )}
                          <button
                            onClick={() => onRemoveDevice(device.id)}
                            title="Remove from history"
                            className="p-1 text-cursor-muted hover:text-[#cf2d56] rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
