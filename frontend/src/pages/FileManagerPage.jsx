import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import FileGrid from "../components/FileGrid";
import CategoryView from "../components/CategoryView";
import StorageVisualizer from "../components/StorageVisualizer";
import OrganizeAnimation from "../components/OrganizeAnimation";
import Loader from "../components/Loader";
import FileManagerSidebar from "../components/FileManagerSidebar";
import FileManagerToolbar from "../components/FileManagerToolbar";
import FileManagerTable from "../components/FileManagerTable";
import Breadcrumbs from "../components/Breadcrumbs";
import FilePreview from "../components/FilePreview";
import RecycleBin from "../components/RecycleBin";
import { formatFileSize } from "../utils/fileUtils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function FileManagerPage() {
  const [currentPath, setCurrentPath] = useState("");
  const [browseData, setBrowseData] = useState({ path: "", folders: [], files: [] });
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState({});
  const [viewMode, setViewMode] = useState("table"); // table | grid | category | storage
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [showOrganizeAnimation, setShowOrganizeAnimation] = useState(false);
  const [organizingFiles, setOrganizingFiles] = useState([]);
  const [deletingFile, setDeletingFile] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);

  const fetchBrowse = useCallback(async (path) => {
    try {
      const url = `${API_URL}/api/browse${path ? `?path=${encodeURIComponent(path)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setBrowseData(data);
    } catch (e) {
      console.error("Browse error:", e);
      setBrowseData({ path: path, folders: [], files: [] });
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/files`);
      const data = await res.json();
      setFiles(data.files || []);
      setCategories(data.categories || {});
    } catch (e) {
      console.error("Files error:", e);
    }
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchBrowse(currentPath), fetchFiles()]);
    setIsLoading(false);
  }, [currentPath, fetchBrowse, fetchFiles]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilesUploaded = () => {
    setShowUploadZone(false);
    load();
  };

  const handleOrganize = async () => {
    setIsOrganizing(true);
    try {
      const res = await fetch(`${API_URL}/api/organize`, { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.success && data.operations) {
        const moved = (data.operations || []).filter((op) => op.status === "moved").map((op) => ({ name: op.file, category: op.category }));
        if (moved.length > 0) {
          setOrganizingFiles(moved);
          setShowOrganizeAnimation(true);
        } else {
          await load();
          setViewMode("category");
          setIsOrganizing(false);
        }
      } else {
        setIsOrganizing(false);
      }
    } catch (e) {
      console.error(e);
      setIsOrganizing(false);
    }
  };

  const handleAnimationComplete = async () => {
    setShowOrganizeAnimation(false);
    await load();
    setViewMode("category");
    setIsOrganizing(false);
  };

  const handleDelete = async (fileName, relativePath) => {
    if (!confirm(`Delete ${fileName}?`)) return;
    setDeletingFile(fileName);
    try {
      const url = `${API_URL}/api/files/${encodeURIComponent(fileName)}${relativePath ? `?path=${encodeURIComponent(relativePath)}` : ""}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) await load();
      else alert(data.error || "Failed to delete");
    } catch (e) {
      alert("Delete failed");
    } finally {
      setDeletingFile(null);
    }
  };

  const handleMove = async (fileName, targetCategory, relativePath) => {
    setIsMoving(true);
    try {
      const res = await fetch(`${API_URL}/api/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, targetCategory, sourcePath: relativePath || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) await load();
      else alert(data.error || "Failed to move");
    } catch (e) {
      alert("Move failed");
    } finally {
      setIsMoving(false);
    }
  };

  const handleCreateFolder = async (folderName) => {
    const path = currentPath ? `${currentPath}/${folderName}` : folderName;
    try {
      const res = await fetch(`${API_URL}/api/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const data = await res.json();
      if (res.ok && data.success) await load();
      else alert(data.error || "Failed to create folder");
    } catch (e) {
      alert("Create folder failed");
    }
  };

  const handleRename = async (relativePath, newName) => {
    try {
      const res = await fetch(`${API_URL}/api/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relativePath, newName }),
      });
      const data = await res.json();
      if (res.ok && data.success) await load();
      else alert(data.error || "Failed to rename");
    } catch (e) {
      alert("Rename failed");
    }
  };

  const handleCopy = async (relativePath, targetPath) => {
    try {
      const res = await fetch(`${API_URL}/api/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relativePath, targetPath }),
      });
      const data = await res.json();
      if (res.ok && data.success) await load();
      else alert(data.error || "Failed to copy");
    } catch (e) {
      alert("Copy failed");
    }
  };
  
  const handleRestore = async (trashName) => {
    try {
      const res = await fetch(`${API_URL}/api/trash/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trashName }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to restore");
      else await load();
    } catch (e) {
      alert("Restore failed");
    }
  };

  const handlePermanentDelete = async (trashName) => {
    try {
      const res = await fetch(`${API_URL}/api/trash/${encodeURIComponent(trashName)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to delete permanently");
      // No need to reload whole app state, RecycleBin handles its own refresh
    } catch (e) {
      alert("Delete failed");
    }
  };

  const handleEmptyBin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/trash-empty`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to empty bin");
      else await load();
    } catch (e) {
      alert("Empty bin failed");
    }
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      setSearchResults([]);
    }
  };

  const inSearchMode = searchQuery.trim() !== "";
  const displayFolders = searchResults !== null
    ? (searchResults || []).filter((r) => r.isFolder).map((r) => ({ name: r.name, relativePath: r.relativePath }))
    : browseData.folders || [];
  const displayFiles = searchResults !== null
    ? (searchResults || []).filter((r) => !r.isFolder)
    : browseData.files || [];

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <img src="/favicon.svg" alt="" className="w-8 h-8 rounded-lg flex-shrink-0" />
              <span className="font-semibold">File Organizer</span>
            </Link>
            <Breadcrumbs currentPath={currentPath} onNavigate={setCurrentPath} />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Team Mavericks</span>
          </div>
        </div>
        <FileManagerToolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          onUploadClick={() => setShowUploadZone(true)}
          onNewFolder={() => handleCreateFolder(prompt("Folder name:") || "")}
          organizingFiles={organizingFiles}
          onOrganize={handleOrganize}
          isOrganizing={isOrganizing}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          currentPath={currentPath}
        />
      </header>

      {isMoving && <Loader message="Moving file..." />}
      {showOrganizeAnimation && <OrganizeAnimation files={organizingFiles} onComplete={handleAnimationComplete} />}

      <div className="flex flex-1 min-h-0">
        <FileManagerSidebar
          currentPath={currentPath}
          onNavigate={(p) => { setCurrentPath(p); setSearchQuery(""); setSearchResults(null); }}
          browseData={browseData}
          onRefresh={load}
        />

        <main className="flex-1 overflow-auto p-4">
          {showUploadZone && currentPath !== "__trash__" && (
            <div className="mb-4">
              <FileUpload onFilesUploaded={handleFilesUploaded} currentPath={currentPath} />
              <button type="button" onClick={() => setShowUploadZone(false)} className="mt-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : currentPath === "__trash__" ? (
            <RecycleBin 
                onRestore={handleRestore} 
                onPermanentDelete={handlePermanentDelete} 
                onEmptyBin={handleEmptyBin}
                onNavigate={setCurrentPath}
            />
          ) : viewMode === "storage" ? (
            <StorageVisualizer />
          ) : viewMode === "category" ? (
            <div className="card p-6">
              <CategoryView categories={categories} onDelete={(n) => handleDelete(n)} onMove={handleMove} deletingFile={deletingFile} />
            </div>
          ) : (
            <>
              {inSearchMode && (
                <p className="text-sm text-gray-600 mb-3">
                  Search: &quot;{searchQuery}&quot; — {Array.isArray(searchResults) ? searchResults.length : 0} results
                </p>
              )}
              {viewMode === "table" ? (
                <FileManagerTable
                  folders={displayFolders}
                  files={displayFiles}
                  currentPath={currentPath}
                  onNavigate={setCurrentPath}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  onRename={handleRename}
                  onCopy={handleCopy}
                  deletingFile={deletingFile}
                  inSearchMode={inSearchMode}
                />
              ) : (
                <div className="card p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayFolders.map((f) => (
                      <div
                        key={f.relativePath}
                        onClick={() => {
                          setCurrentPath(f.relativePath);
                          if (inSearchMode) { setSearchQuery(""); setSearchResults(null); }
                        }}
                        className="flex flex-col items-center p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                          <svg className="w-7 h-7 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate w-full text-center">{f.name}</span>
                        <span className="text-xs text-gray-500 mt-0.5 text-center">
                          {f.fileCount != null ? `${f.fileCount} item${f.fileCount !== 1 ? "s" : ""}` : ""}
                          {f.fileCount != null && f.totalSize != null ? " · " : ""}
                          {f.totalSize != null ? formatFileSize(f.totalSize) : ""}
                        </span>
                      </div>
                    ))}
                    {displayFiles.map((file) => (
                      <FileCardGridItem
                        key={file.relativePath || file.name}
                        file={file}
                        onDelete={handleDelete}
                        onMove={handleMove}
                        deletingFile={deletingFile}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function FileCardGridItem({ file, onDelete, onMove, deletingFile }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const url = file.relativePath ? `${API_URL}/uploads/${encodeURI(file.relativePath)}` : null;
  const isDeleting = deletingFile === file.name;
  return (
    <div className={`flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow ${isDeleting ? "opacity-50" : ""}`}>
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col flex-1 p-3">
        <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center mb-2 overflow-hidden">
          <FilePreview file={file} size="fill" className="rounded-lg" />
        </div>
        <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
        <span className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</span>
      </a>
      <div className="flex gap-1 p-2 border-t border-gray-100">
        <button type="button" onClick={() => onMove(file.name, prompt("Target category (e.g. Documents):") || "", file.relativePath)} className="flex-1 text-xs py-1.5 rounded bg-gray-100 hover:bg-gray-200" title="Move">Move</button>
        <button type="button" onClick={() => onDelete(file.name, file.relativePath)} disabled={isDeleting} className="flex-1 text-xs py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100" title="Delete">Delete</button>
      </div>
    </div>
  );
}
