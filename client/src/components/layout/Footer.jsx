import React from 'react';
import { HardDrive, Network, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200 text-slate-500 text-xs text-center">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-700">LAN File Storage MVP</span>
          <span>•</span>
          <span>Lightweight Self-Hosted Storage</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <span className="flex items-center space-x-1">
            <Network className="w-3.5 h-3.5" />
            <span>LAN First</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encapsulated Local Filesystem</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
