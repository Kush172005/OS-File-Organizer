import { useState } from "react";
import { createPortal } from "react-dom";
import FilePreview from "./FilePreview";
import { formatFileSize, formatModifiedDate } from "../utils/fileUtils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function FileManagerTable({
  folders,
  files,
  currentPath,
  onNavigate,
  onDelete,
  onMove,
  onRename,
  onCopy,
  deletingFile,
  inSearchMode,
  showPathColumn = false,
}) {
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [copyTarget, setCopyTarget] = useState(null);
  const [copyPathValue, setCopyPathValue] = useState("");
  const [menuFile, setMenuFile] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleRenameSubmit = (relativePath, currentName, newName) => {
    const v = (newName !== undefined ? newName : renameValue).trim();
    if (v && v !== currentName) {
      onRename(relativePath, v);
    }
    setRenaming(null);
    setRenameValue("");
  };

  const handleCopySubmit = (relativePath, targetPath) => {
    const v = (targetPath !== undefined ? targetPath : copyPathValue).trim();
    if (v) {
      onCopy(relativePath, v);
    }
    setCopyTarget(null);
    setCopyPathValue("");
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/80 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-700/80 border-b border-slate-600/80">
            <th className="text-left py-3.5 px-5 font-semibold text-slate-300">Name</th>
            {showPathColumn && <th className="text-left py-3.5 px-5 font-semibold text-slate-300 w-32">Location</th>}
            <th className="text-left py-3.5 px-5 font-semibold text-slate-300 w-28">Type</th>
            <th className="text-left py-3.5 px-5 font-semibold text-slate-300 w-24">Size</th>
            <th className="text-left py-3.5 px-5 font-semibold text-slate-300 w-40">Modified</th>
            <th className="w-12 py-3.5 px-2" />
          </tr>
        </thead>
        <tbody>
          {folders.map((f) => (
            <tr key={f.relativePath} className="border-b border-slate-700/60 hover:bg-slate-700/40 transition-colors">
              <td className="py-3 px-5">
                <button
                  type="button"
                  onClick={() => !inSearchMode && onNavigate(f.relativePath)}
                  className="flex items-center gap-3 text-left font-medium text-slate-200 hover:text-indigo-400 transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-amber-400/30">
                    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  {f.name}
                </button>
              </td>
              {showPathColumn && <td className="py-3 px-5 text-slate-500 text-xs">—</td>}
              <td className="py-3 px-5 text-slate-400">
                {f.fileCount != null ? `${f.fileCount} item${f.fileCount !== 1 ? "s" : ""}` : "Folder"}
              </td>
              <td className="py-3 px-5 text-slate-400">{formatFileSize(f.totalSize)}</td>
              <td className="py-3 px-5 text-slate-400">{formatModifiedDate(f.modifiedAt)}</td>
              <td className="py-3 px-2" />
            </tr>
          ))}
          {files.map((file) => (
            <tr key={file.relativePath || file.name} className="border-b border-slate-700/60 hover:bg-slate-700/40 transition-colors">
              <td className="py-3 px-5">
                <div className="flex items-center gap-3">
                  <FilePreview file={file} size="sm" />
                  <a
                    href={file.relativePath ? `${API_URL}/uploads/${encodeURI(file.relativePath)}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-slate-200 hover:text-indigo-400 truncate transition-colors"
                  >
                    {file.name}
                  </a>
                </div>
              </td>
              {showPathColumn && (
                <td className="py-3 px-5 text-slate-500 text-xs truncate max-w-[120px]" title={file.relativePath || ""}>
                  {file.relativePath && file.relativePath.includes("/") ? file.relativePath.replace(/\/[^/]+$/, "") : "—"}
                </td>
              )}
              <td className="py-3 px-5 text-slate-400">{file.category || "—"}</td>
              <td className="py-3 px-5 text-slate-400">{formatFileSize(file.size)}</td>
              <td className="py-3 px-5 text-slate-400">{formatModifiedDate(file.modifiedAt)}</td>
              <td className="py-3 px-2">
                <button
                  type="button"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    if (menuFile?.relativePath === file.relativePath) {
                      setMenuFile(null);
                    } else {
                      setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                      setMenuFile(file);
                    }
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-600 hover:text-slate-200 transition-colors"
                  title="Actions"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {menuFile && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setMenuFile(null)} aria-hidden="true" />
          <div
            className="fixed z-[9999] min-w-[160px] py-1.5 bg-slate-800 rounded-xl border border-slate-600 shadow-xl"
            style={{ top: menuPosition.top, right: menuPosition.right }}
          >
            <a
              href={menuFile.relativePath ? `${API_URL}/api/download?path=${encodeURIComponent(menuFile.relativePath)}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
              onClick={() => setMenuFile(null)}
            >
              Download
            </a>
            <button type="button" onClick={() => { setRenaming(menuFile); setRenameValue(menuFile.name); setMenuFile(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 text-left transition-colors">
              Rename
            </button>
            <button type="button" onClick={() => { setCopyTarget(menuFile); setMenuFile(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 text-left transition-colors">
              Copy to…
            </button>
            <button type="button" onClick={() => { onMove(menuFile.name, prompt("Target category folder:"), menuFile.relativePath); setMenuFile(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 text-left transition-colors">
              Move
            </button>
            <button type="button" onClick={() => { onDelete(menuFile.name, menuFile.relativePath); setMenuFile(null); }} disabled={deletingFile === menuFile.name} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 text-left disabled:opacity-50 transition-colors">
              Delete
            </button>
          </div>
        </>,
        document.body
      )}

      {folders.length === 0 && files.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-slate-400 font-medium">No files or folders here.</p>
          <p className="text-sm text-slate-500 mt-1">Upload files or create a folder to get started.</p>
        </div>
      )}

      {renaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setRenaming(null); setRenameValue(""); }}>
          <div className="bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border border-slate-600" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-100 mb-3">Rename</h3>
            <input
              type="text"
              value={renameValue || renaming.name}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-600 rounded-xl bg-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit(renaming.relativePath, renaming.name, e.target.value);
                if (e.key === "Escape") { setRenaming(null); setRenameValue(""); }
              }}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => { setRenaming(null); setRenameValue(""); }} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition-colors">Cancel</button>
              <button type="button" onClick={() => handleRenameSubmit(renaming.relativePath, renaming.name)} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {copyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setCopyTarget(null); setCopyPathValue(""); }}>
          <div className="bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border border-slate-600" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-100 mb-2">Copy to folder</h3>
            <p className="text-sm text-slate-400 mb-3 truncate">{copyTarget.name}</p>
            <input
              type="text"
              value={copyPathValue}
              onChange={(e) => setCopyPathValue(e.target.value)}
              placeholder="e.g. Documents or Images/Sub"
              className="w-full px-4 py-2.5 border border-slate-600 rounded-xl bg-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCopySubmit(copyTarget.relativePath, e.target.value);
                if (e.key === "Escape") { setCopyTarget(null); setCopyPathValue(""); }
              }}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => { setCopyTarget(null); setCopyPathValue(""); }} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition-colors">Cancel</button>
              <button type="button" onClick={() => handleCopySubmit(copyTarget.relativePath)} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
