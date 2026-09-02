import React from 'react';
import { HardDrive, Network, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-cursor-hairline dark:border-cursor-dark-hairline text-cursor-muted text-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-3.5 h-3.5 text-cursor-orange" />
          <span className="text-cursor-ink dark:text-cursor-dark-ink font-normal">Cursor DFS</span>
          <span>•</span>
          <span className="font-mono">LAN-First Distributed Storage</span>
        </div>
        <div className="flex items-center space-x-4 font-mono text-[11px] text-cursor-muted">
          <span className="flex items-center space-x-1">
            <Network className="w-3 h-3" />
            <span>LAN UDP Discovery</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Encapsulated Local FS</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
