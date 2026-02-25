import { useState, useRef, useEffect } from "react";
import { SORT_OPTIONS } from "../utils/fileUtils";

export default function FileManagerToolbar({
  viewMode,
  setViewMode,
  onUploadClick,
  onNewFolder,
  onOrganize,
  isOrganizing,
  searchQuery,
  onSearch,
  currentPath,
  sortBy,
  sortOrder,
  onSortChange,
  showSort,
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.by === sortBy && o.order === sortOrder)?.label || "Sort";

  const isInTrash = currentPath === "__trash__";

  const viewModes = [
    { id: "table", label: "Table", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
    { id: "grid", label: "Grid", icon: "M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zM14 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z" },
    { id: "category", label: "Category", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" },
    { id: "storage", label: "Storage", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-slate-800/50 border-t border-slate-700/80">
      <div className="flex items-center gap-2">
        {!isInTrash && (
          <>
            <button
              type="button"
              onClick={onUploadClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload
            </button>
            <button
              type="button"
              onClick={onNewFolder}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-600 border border-slate-600 transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
              New folder
            </button>
            <button
              type="button"
              onClick={onOrganize}
              disabled={isOrganizing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-500 disabled:opacity-50 transition-all duration-200"
            >
              {isOrganizing ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <polyline points="22 12 16 12 14 15 10 15 10 12 2 12" />
                </svg>
              )}
              Organize
            </button>
          </>
        )}
      </div>

      <div className="flex-1 min-w-[220px] max-w-md">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700/80 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-shadow"
          />
        </div>
      </div>

      {showSort && typeof sortBy === "string" && typeof sortOrder === "string" && onSortChange && (
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 border border-slate-600 text-slate-200 text-sm font-medium hover:bg-slate-600 transition-all"
          >
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            {currentSortLabel}
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${sortOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {sortOpen && (
            <div className="absolute left-0 top-full mt-1.5 py-1 min-w-[220px] bg-slate-800 rounded-xl border border-slate-600 shadow-xl z-50 overflow-hidden">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSortChange(opt.by, opt.order);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortBy === opt.by && sortOrder === opt.order ? "bg-indigo-600/30 text-indigo-300 font-medium" : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-0.5 p-1 rounded-xl bg-slate-700/60 border border-slate-600/80">
        {viewModes.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setViewMode(v.id)}
            title={v.label}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              viewMode === v.id ? "bg-slate-600 text-indigo-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-600/50"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={v.icon} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
