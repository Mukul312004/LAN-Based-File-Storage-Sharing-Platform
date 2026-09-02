import React from 'react';
import { HardDrive, Server, Wifi, RefreshCw } from 'lucide-react';

export default function Header({
  serverInfo,
  activeTarget,
  onResetToLocal,
  onRefresh,
  loading,
}) {
  const isRemote = activeTarget !== null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Node Info */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
              <HardDrive className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg">
                  LAN Storage
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  LAN Online
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {serverInfo ? `${serverInfo.serverName} • ${serverInfo.host}:${serverInfo.port}` : 'Connecting...'}
              </p>
            </div>
          </div>

          {/* Target Storage indicator & Action */}
          <div className="flex items-center space-x-3">
            {isRemote ? (
              <div className="flex items-center bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs text-amber-800 space-x-2">
                <Server className="w-4 h-4 text-amber-600" />
                <span className="font-medium truncate max-w-[120px] sm:max-w-none">
                  Remote: {activeTarget.name || activeTarget.host}
                </span>
                <button
                  onClick={onResetToLocal}
                  className="ml-1 text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded font-semibold transition"
                >
                  Switch to Local
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 space-x-1.5">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                <span>Active: <strong>My Local Storage</strong></span>
              </div>
            )}

            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh files and stats"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
