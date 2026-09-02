import React, { useState } from 'react';
import { Server, Wifi, Copy, Check, ShieldCheck, Laptop } from 'lucide-react';

export default function ServerStatusCard({ serverInfo, activeTarget }) {
  const [copied, setCopied] = useState(false);

  const isRemote = activeTarget !== null;
  const currentName = isRemote ? activeTarget.name || 'Remote Peer' : serverInfo?.serverName || 'My Storage Node';
  const currentHost = isRemote ? activeTarget.host : serverInfo?.host || '127.0.0.1';
  const currentPort = isRemote ? activeTarget.port : serverInfo?.port || 3000;
  const fullUrl = `http://${currentHost}:${currentPort}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            {isRemote ? <Laptop className="w-5 h-5" /> : <Server className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isRemote ? 'Remote Server' : 'Local Server'}
            </span>
            <h2 className="text-lg font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
              {currentName}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online</span>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div>
          <div className="text-xs text-slate-500 mb-1 flex items-center space-x-1">
            <Wifi className="w-3.5 h-3.5" />
            <span>LAN Network Address</span>
          </div>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs sm:text-sm text-slate-800">
            <span className="truncate mr-2 font-medium">{fullUrl}</span>
            <button
              onClick={copyToClipboard}
              title="Copy URL"
              className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-md transition shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Bound to 0.0.0.0:{currentPort}</span>
          </span>
          <span>v{serverInfo?.version || '1.0.0'}</span>
        </div>
      </div>
    </div>
  );
}
