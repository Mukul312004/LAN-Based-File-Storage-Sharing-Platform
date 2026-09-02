import React, { useState } from 'react';
import { Wifi, Radio, Laptop, ArrowRight, Plus, CheckCircle, RefreshCw, Search } from 'lucide-react';

export default function DiscoveredDevicesCard({
  devices = [],
  activeTarget,
  onSelectDevice,
  onConnectManual,
  onScanNetwork,
  isScanning,
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
              <h2 className="text-lg font-bold text-slate-900">Available Devices</h2>
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

        <div className="space-y-2.5 pt-2 border-t border-slate-100 max-h-48 overflow-y-auto">
          {devices.length === 0 ? (
            <div className="text-center py-4 px-2 text-slate-400 text-xs">
              <Wifi className="w-6 h-6 mx-auto mb-1.5 opacity-40 animate-pulse" />
              <p>{isScanning ? 'Scanning local Wi-Fi subnet...' : 'Listening for other storage nodes...'}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Make sure other devices are running the server or click <strong>Scan</strong> / <strong>Manual</strong>.
              </p>
            </div>
          ) : (
            devices.map((device) => {
              const isCurrentActive = activeTarget?.host === device.host && activeTarget?.port === device.port;

              return (
                <div
                  key={device.id || `${device.host}:${device.port}`}
                  className={`p-3 rounded-xl border flex items-center justify-between transition ${
                    isCurrentActive
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate mr-2">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs text-slate-700">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {device.name || 'Storage Peer'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {device.host}:{device.port}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCurrentActive ? (
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
