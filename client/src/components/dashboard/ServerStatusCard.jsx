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
    <div className="bg-cursor-card dark:bg-cursor-dark-card rounded-lg p-5 border border-cursor-hairline dark:border-cursor-dark-hairline transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cursor-canvas-soft dark:bg-cursor-dark-canvas-soft text-cursor-ink dark:text-cursor-dark-ink border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md">
            {isRemote ? <Laptop className="w-4 h-4 text-cursor-orange" /> : <Server className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-cursor-muted dark:text-cursor-dark-body">
              {isRemote ? 'Remote Node' : 'Local Node'}
            </span>
            <h2 className="text-lg font-normal text-cursor-ink dark:text-cursor-dark-ink tracking-editorial truncate max-w-[200px] sm:max-w-xs">
              {currentName}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#9fc9a2]/20 border border-[#9fc9a2]/40 text-[#1f8a65] dark:text-[#9fc9a2] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1f8a65] dark:bg-[#9fc9a2] animate-pulse"></span>
          <span>Online</span>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-cursor-hairline-soft dark:border-cursor-dark-hairline">
        <div>
          <div className="text-[11px] text-cursor-muted dark:text-cursor-dark-body mb-1 flex items-center space-x-1">
            <Wifi className="w-3 h-3" />
            <span>LAN Network URL</span>
          </div>
          <div className="flex items-center justify-between bg-cursor-canvas dark:bg-cursor-dark-canvas border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md p-2 font-mono text-xs text-cursor-ink dark:text-cursor-dark-ink">
            <span className="truncate mr-2">{fullUrl}</span>
            <button
              onClick={copyToClipboard}
              title="Copy URL"
              className="p-1 hover:bg-cursor-canvas-soft dark:hover:bg-cursor-dark-card text-cursor-muted hover:text-cursor-ink dark:hover:text-cursor-dark-ink rounded transition shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1f8a65] dark:text-[#9fc9a2]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-cursor-muted dark:text-cursor-dark-body pt-1 font-mono">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-cursor-muted" />
            <span>0.0.0.0:{currentPort}</span>
          </span>
          <span>v{serverInfo?.version || '1.0.0'}</span>
        </div>
      </div>
    </div>
  );
}
