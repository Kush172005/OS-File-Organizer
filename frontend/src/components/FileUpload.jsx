import { useState, useRef } from "react";

function FileUpload({ onFilesUploaded, currentPath = "" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const fileInputRef = useRef(null);
  
  const isHome = currentPath === "";
  const isTrash = currentPath === "__trash__";

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const files = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        if (item) {
          await traverseFileTree(item, files);
        }
      }
    } else {
      files.push(...Array.from(e.dataTransfer.files));
    }

    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const traverseFileTree = async (item, files) => {
    if (item.isFile) {
      return new Promise((resolve) => {
        item.file((file) => {
          files.push(file);
          resolve();
        });
      });
    } else if (item.isDirectory) {
      const dirReader = item.createReader();
      return new Promise((resolve) => {
        dirReader.readEntries(async (entries) => {
          for (const entry of entries) {
            await traverseFileTree(entry, files);
          }
          resolve();
        });
      });
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadCount(files.length);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      // Don't append folder param if in trash
      const uploadUrl = (currentPath && !isTrash) ? `${apiUrl}/api/upload?folder=${encodeURIComponent(currentPath)}` : `${apiUrl}/api/upload`;
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        onFilesUploaded();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadCount(0);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/80 p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragging ? "border-indigo-400 bg-indigo-500/20" : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/40"}
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          webkitdirectory={isHome ? "true" : undefined}
          directory={isHome ? "true" : undefined}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/30">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-400 border-t-transparent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Uploading {uploadCount} file{uploadCount !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-slate-500 mt-1">Please wait…</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-700">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {isHome ? "Select a folder to organize" : isTrash ? "Upload files to Recycle Bin" : "Upload files to this folder"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isHome ? "or drag and drop here" : "Drag and drop supported"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
