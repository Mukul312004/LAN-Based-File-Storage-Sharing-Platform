import React from 'react';
import { HardDrive, Server, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Header({
  serverInfo,
  activeTarget,
  onResetToLocal,
  onRefresh,
  loading,
  isDark,
  onToggleTheme,
}) {
  const isRemote = activeTarget !== null;

  return (
    <header className="bg-cursor-canvas dark:bg-cursor-dark-canvas border-b border-cursor-hairline dark:border-cursor-dark-hairline sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Node Info */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cursor-orange text-white rounded-md transition">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-normal text-cursor-ink dark:text-cursor-dark-ink text-base tracking-editorial">
                  Cursor DFS
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#9fc9a2]/25 text-[#1f8a65] dark:text-[#9fc9a2] border border-[#9fc9a2]/40">
                  <span className="w-1.5 h-1.5 mr-1.5 bg-[#1f8a65] dark:bg-[#9fc9a2] rounded-full animate-pulse"></span>
                  LAN Online
                </span>
              </div>
              <p className="text-xs text-cursor-muted dark:text-cursor-dark-body font-mono hidden sm:block">
                {serverInfo ? `${serverInfo.serverName} • ${serverInfo.host}:${serverInfo.port}` : 'Connecting...'}
              </p>
            </div>
          </div>

          {/* Target Storage indicator, Refresh & Theme Toggle */}
          <div className="flex items-center space-x-2.5">
            {isRemote ? (
              <div className="flex items-center bg-[#dfa88f]/20 border border-[#dfa88f]/50 rounded-md px-2.5 py-1 text-xs text-cursor-ink dark:text-cursor-dark-ink space-x-2">
                <Server className="w-3.5 h-3.5 text-cursor-orange" />
                <span className="font-medium truncate max-w-[120px] sm:max-w-none">
                  Remote: {activeTarget.name || activeTarget.host}
                </span>
                <button
                  onClick={onResetToLocal}
                  className="text-[11px] bg-cursor-orange hover:bg-cursor-orange-active text-white px-2 py-0.5 rounded transition font-medium"
                >
                  Switch to Local
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center bg-cursor-card dark:bg-cursor-dark-card border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md px-2.5 py-1 text-xs text-cursor-body dark:text-cursor-dark-body space-x-1.5">
                <Server className="w-3.5 h-3.5 text-cursor-muted" />
                <span>Node: <strong className="text-cursor-ink dark:text-cursor-dark-ink font-normal">Local Storage</strong></span>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh files and stats"
              className="p-2 text-cursor-muted hover:text-cursor-ink dark:hover:text-cursor-dark-ink hover:bg-cursor-canvas-soft dark:hover:bg-cursor-dark-canvas-soft border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md transition disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="p-2 text-cursor-muted hover:text-cursor-ink dark:hover:text-cursor-dark-ink hover:bg-cursor-canvas-soft dark:hover:bg-cursor-dark-canvas-soft border border-cursor-hairline dark:border-cursor-dark-hairline rounded-md transition"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-[#dfa88f]" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
