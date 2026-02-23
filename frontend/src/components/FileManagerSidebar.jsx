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

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">Locations</h2>
        <button
          type="button"
          onClick={() => onNavigate("")}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors ${
            !currentPath ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Home
        </button>
        <button
          type="button"
          onClick={() => onNavigate("__trash__")}
          className={`w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-left text-sm font-medium transition-colors ${
            currentPath === "__trash__" ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Recycle Bin
        </button>
      </div>
      <div className="p-3 flex-1 overflow-auto">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">Folders</h2>
        <div className="space-y-0.5">
          {rootFolders.map((f) => (
            <button
              key={f.relativePath}
              type="button"
              onClick={() => onNavigate(f.relativePath)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                currentPath === f.relativePath ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span className="truncate">{f.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
