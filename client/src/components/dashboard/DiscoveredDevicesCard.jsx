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
  PowerOff,
  Trash2,
} from 'lucide-react';

function getDeviceIcon(device) {
  if (device.deviceType === 'phone' || /phone|android|iphone/i.test(device.name)) {
    return <Smartphone className="w-4 h-4 text-emerald-600" />;
  }
  if (device.deviceType === 'tablet' || /tablet|ipad/i.test(device.name)) {
    return <Tablet className="w-4 h-4 text-purple-600" />;
  }
  if (device.type === 'client') {
    return <Laptop className="w-4 h-4 text-blue-600" />;
  }
  return <Server className="w-4 h-4 text-indigo-600" />;
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
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Radio className={`w-5 h-5 ${isScanning ? 'animate-spin text-blue-600' : 'animate-pulse'}`} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                LAN Network Discovery
              </span>
              <h2 className="text-lg font-bold text-slate-900">Connected & Peer Devices</h2>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onScanNetwork}
              disabled={isScanning}
              title="Perform active subnet scan"
              className="text-xs text-slate-600 hover:text-blue-600 font-medium flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
            </button>

            <button
              onClick={() => setShowManual(!showManual)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual</span>
            </button>
          </div>
        </div>

        {showManual && (
          <form onSubmit={handleManualSubmit} className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="font-semibold text-slate-700">Connect to Device by IP</div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. 192.168.29.15"
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="3000"
                value={manualPort}
                onChange={(e) => setManualPort(e.target.value)}
                className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shrink-0"
              >
                Connect
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2.5 pt-2 border-t border-slate-100 max-h-56 overflow-y-auto">
          {visibleDevices.length === 0 ? (
            <div className="text-center py-5 px-2 text-slate-400 text-xs">
              <Wifi className="w-6 h-6 mx-auto mb-1.5 opacity-40 animate-pulse" />
              <p>{isScanning ? 'Scanning local Wi-Fi subnet...' : 'No other devices active on LAN right now'}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Open <strong>http://192.168.29.17:5173</strong> on your phone to connect!
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
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      isCurrentActive
                        ? 'bg-blue-50 border-blue-300'
                        : isClient
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate mr-2">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        {getDeviceIcon(device)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center space-x-1.5">
                          <span>{device.name || (isClient ? 'Connected Device' : 'Storage Peer')}</span>
                          {isClient && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-semibold rounded">
                              Client
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {device.host ? `${device.host}:${device.port}` : `${device.ip || 'LAN Client'}`}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isClient ? (
                        <span className="inline-flex items-center text-[11px] text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-100 rounded-md">
                          <span className="w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full animate-pulse"></span>
                          Active Now
                        </span>
                      ) : isCurrentActive ? (
                        <span className="inline-flex items-center text-xs text-blue-700 font-semibold px-2 py-1 bg-blue-100 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Connected
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectDevice(device)}
                          className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition"
                        >
                          <span>Connect</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Offline / Previously Connected Devices */}
              {offlineDevices.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
                    <span>DISCONNECTED / PREVIOUS PEERS</span>
                    <button
                      onClick={onClearOffline}
                      className="text-slate-400 hover:text-slate-600 hover:underline"
                    >
                      Clear
                    </button>
                  </div>

                  {offlineDevices.map((device) => {
                    const isClient = device.type === 'client';
                    return (
                      <div
                        key={device.id || `${device.host || device.ip}:${device.port || 'offline'}`}
                        className="p-2.5 mb-1.5 rounded-xl border border-slate-200/70 bg-slate-50/40 opacity-75 hover:opacity-100 transition flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2.5 truncate mr-2">
                          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                            {getDeviceIcon(device)}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-medium text-slate-600 truncate">
                              {device.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Offline • Seen {formatTimeAgo(device.lastSeen)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {device.host && (
                            <button
                              onClick={() => onSelectDevice(device)}
                              title="Attempt to reconnect to this device"
                              className="text-[11px] font-medium px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition"
                            >
                              Reconnect
                            </button>
                          )}
                          <button
                            onClick={() => onRemoveDevice(device.id)}
                            title="Remove from history"
                            className="p-1 text-slate-300 hover:text-slate-600 rounded"
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
