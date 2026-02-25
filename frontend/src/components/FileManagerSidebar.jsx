import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function FileManagerSidebar({ currentPath, onNavigate, browseData, onRefresh }) {
  const [rootFolders, setRootFolders] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/browse`);
        const data = await res.json();
        setRootFolders(data.folders || []);
      } catch (e) {
        setRootFolders([]);
      }
    }
    load();
  }, [browseData.path, onRefresh]);

  const linkClass = (active) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400 -ml-px pl-[11px]"
        : "text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border-l-2 border-transparent"
    }`;

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-800 border-r border-slate-700/80 flex flex-col fm-scrollbar">
      <div className="p-4 border-b border-slate-700/80">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-3">Locations</p>
        <div className="space-y-0.5">
          <button type="button" onClick={() => onNavigate("")} className={linkClass(!currentPath)}>
            <span className="w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </span>
            Home
          </button>
          <button type="button" onClick={() => onNavigate("__all__")} className={linkClass(currentPath === "__all__")}>
            <span className="w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
            All files
          </button>
          <button type="button" onClick={() => onNavigate("__trash__")} className={linkClass(currentPath === "__trash__")}>
            <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </span>
            Recycle Bin
          </button>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-auto">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-3">Folders</p>
        <div className="space-y-0.5">
          {rootFolders.map((f) => (
            <button
              key={f.relativePath}
              type="button"
              onClick={() => onNavigate(f.relativePath)}
              className={linkClass(currentPath === f.relativePath)}
            >
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className="truncate">{f.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
