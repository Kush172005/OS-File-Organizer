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
    <div className="card p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-[#007AFF] bg-blue-50/50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
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
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#007AFF] border-t-transparent"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Uploading {uploadCount} file{uploadCount !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-gray-500 mt-1">Please wait...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-600"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isHome ? "Select a folder to organize" : isTrash ? "Upload files to Recycle Bin" : "Upload files to this folder"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isHome ? "or drag and drop here" : "drag and drop supported"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
