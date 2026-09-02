import React from 'react';
import { HardDrive, Wifi, ShieldCheck } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl text-center space-y-4">
        <div className="mx-auto w-14 h-14 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center justify-center text-teal-400">
          <HardDrive className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">LAN Storage MVP</h1>
        <p className="text-slate-400 text-sm">
          Phase 1 Initialized. Ready for Local File Storage & Network Discovery.
        </p>
        <div className="flex justify-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-700/60">
          <div className="flex items-center gap-1">
            <Wifi className="w-4 h-4 text-teal-400" /> Auto Discovery
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-teal-400" /> Path Protected
          </div>
        </div>
      </div>
    </div>
  );
}
