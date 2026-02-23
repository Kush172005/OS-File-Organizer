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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 w-28">Type</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 w-24">Size</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 w-40">Modified</th>
            <th className="w-10 py-3 px-2" />
          </tr>
        </thead>
        <tbody>
          {folders.map((f) => (
            <tr key={f.relativePath} className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="py-2.5 px-4">
                <button
                  type="button"
                  onClick={() => !inSearchMode && onNavigate(f.relativePath)}
                  className="flex items-center gap-2 text-left font-medium text-gray-900 hover:text-indigo-600"
                >
                  <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  {f.name}
                </button>
              </td>
              <td className="py-2.5 px-4 text-gray-600">
                {f.fileCount != null ? `${f.fileCount} item${f.fileCount !== 1 ? "s" : ""}` : "Folder"}
              </td>
              <td className="py-2.5 px-4 text-gray-600">{formatFileSize(f.totalSize)}</td>
              <td className="py-2.5 px-4 text-gray-600">{formatModifiedDate(f.modifiedAt)}</td>
              <td className="py-2.5 px-2" />
            </tr>
          ))}
          {files.map((file) => (
            <tr key={file.relativePath || file.name} className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-2">
                  <FilePreview file={file} size="sm" />
                  <a
                    href={file.relativePath ? `${API_URL}/uploads/${encodeURI(file.relativePath)}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-900 hover:text-indigo-600 truncate"
                  >
                    {file.name}
                  </a>
                </div>
              </td>
              <td className="py-2.5 px-4 text-gray-600">{file.category || "—"}</td>
              <td className="py-2.5 px-4 text-gray-600">{formatFileSize(file.size)}</td>
              <td className="py-2.5 px-4 text-gray-600">{formatModifiedDate(file.modifiedAt)}</td>
              <td className="py-2.5 px-2">
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
                  className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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
            className="fixed z-[9999] min-w-[140px] py-1 bg-white rounded-lg border border-gray-200 shadow-xl"
            style={{ top: menuPosition.top, right: menuPosition.right }}
          >
            <a
              href={menuFile.relativePath ? `${API_URL}/api/download?path=${encodeURIComponent(menuFile.relativePath)}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setMenuFile(null)}
            >
              Download
            </a>
            <button type="button" onClick={() => { setRenaming(menuFile); setRenameValue(menuFile.name); setMenuFile(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
              Rename
            </button>
            <button type="button" onClick={() => { setCopyTarget(menuFile); setMenuFile(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
              Copy to…
            </button>
            <button type="button" onClick={() => { onMove(menuFile.name, prompt("Target category folder:"), menuFile.relativePath); setMenuFile(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
              Move
            </button>
            <button type="button" onClick={() => { onDelete(menuFile.name, menuFile.relativePath); setMenuFile(null); }} disabled={deletingFile === menuFile.name} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left disabled:opacity-50">
              Delete
            </button>
          </div>
        </>,
        document.body
      )}

      {folders.length === 0 && files.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          <p className="text-sm">No files or folders here.</p>
          <p className="text-xs mt-1">Upload files or create a folder to get started.</p>
        </div>
      )}

      {renaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setRenaming(null); setRenameValue(""); }}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-3">Rename</h3>
            <input
              type="text"
              value={renameValue || renaming.name}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit(renaming.relativePath, renaming.name, e.target.value);
                if (e.key === "Escape") { setRenaming(null); setRenameValue(""); }
              }}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => { setRenaming(null); setRenameValue(""); }} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={() => handleRenameSubmit(renaming.relativePath, renaming.name)} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {copyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setCopyTarget(null); setCopyPathValue(""); }}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-2">Copy to folder</h3>
            <p className="text-sm text-gray-500 mb-3 truncate">{copyTarget.name}</p>
            <input
              type="text"
              value={copyPathValue}
              onChange={(e) => setCopyPathValue(e.target.value)}
              placeholder="e.g. Documents or Images/Sub"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCopySubmit(copyTarget.relativePath, e.target.value);
                if (e.key === "Escape") { setCopyTarget(null); setCopyPathValue(""); }
              }}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => { setCopyTarget(null); setCopyPathValue(""); }} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={() => handleCopySubmit(copyTarget.relativePath)} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
