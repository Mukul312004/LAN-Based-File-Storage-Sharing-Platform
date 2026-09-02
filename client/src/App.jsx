import React from 'react';
import { HardDrive } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full">
        <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full mb-4">
          <HardDrive className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">LAN File Storage</h1>
        <p className="text-slate-600 text-sm">Phase 1 Setup Initialized.</p>
      </div>
    </div>
  );
}

export default App;
