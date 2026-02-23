import { useState, useEffect } from "react";
import { formatFileSize } from "../utils/fileUtils";
import FilePreview from "./FilePreview";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function RecycleBin({ onRestore, onPermanentDelete, onEmptyBin, onNavigate }) {
  const [trashFiles, setTrashFiles] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTrash = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/trash`);
      const data = await res.json();
      setTrashFiles(data.trash || []);
    } catch (e) {
      console.error("Fetch trash error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (trashName) => {
    await onRestore(trashName);
    fetchTrash();
  };

  const handlePermanentDelete = async (trashName) => {
    if (!confirm("Are you sure you want to permanently delete this file? This action cannot be undone.")) return;
    await onPermanentDelete(trashName);
    fetchTrash();
  };

  const handleEmptyBin = async () => {
    if (!confirm("Are you sure you want to empty the Recycle Bin? All files will be permanently deleted.")) return;
    await onEmptyBin();
    fetchTrash();
  };

  if (trashFiles.length === 0 && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Recycle Bin is empty</h3>
        <p className="text-sm text-gray-500 mt-1">Files you delete will appear here.</p>
        <button
            onClick={() => onNavigate("")}
            className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
            Go back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recycle Bin</h2>
          <p className="text-xs text-gray-500 mt-0.5">{trashFiles.length} item{trashFiles.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleEmptyBin}
          className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Empty Bin
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Size</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Deleted At</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trashFiles.map((file) => (
              <tr key={file.trashName} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FilePreview file={file} size="md" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{file.originalName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-indigo-50 text-indigo-600">
                    {file.category}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(file.deletedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleRestore(file.trashName)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Restore"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(file.trashName)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Permanently"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
