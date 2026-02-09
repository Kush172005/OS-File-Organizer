import { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import FileGrid from "./components/FileGrid";
import CategoryView from "./components/CategoryView";
import Header from "./components/Header";
import OrganizeAnimation from "./components/OrganizeAnimation";
import Loader from "./components/Loader";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function App() {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState({});
  const [view, setView] = useState("grid");
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingFile, setDeletingFile] = useState(null);
  const [showOrganizeAnimation, setShowOrganizeAnimation] = useState(false);
  const [organizingFiles, setOrganizingFiles] = useState([]);
  const [isMoving, setIsMoving] = useState(false);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/files`);
      const data = await response.json();
      setFiles(data.files || []);
      setCategories(data.categories || {});
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFilesUploaded = () => {
    fetchFiles();
  };

  const handleOrganize = async () => {
    setIsOrganizing(true);
    try {
      const response = await fetch(`${API_URL}/api/organize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success && data.operations) {
        // Prepare files for animation
        const movedFiles = data.operations
          .filter((op) => op.status === "moved")
          .map((op) => ({
            name: op.file,
            category: op.category,
          }));

        if (movedFiles.length > 0) {
          setOrganizingFiles(movedFiles);
          setShowOrganizeAnimation(true);
        } else {
          // No files to move, just refresh
          await fetchFiles();
          setView("category");
          setIsOrganizing(false);
        }
      } else {
        alert("Failed to organize files");
        setIsOrganizing(false);
      }
    } catch (error) {
      console.error("Error organizing files:", error);
      alert("Error organizing files. Check console for details.");
      setIsOrganizing(false);
    }
  };

  const handleAnimationComplete = async () => {
    setShowOrganizeAnimation(false);
    await fetchFiles();
    setView("category");
    setIsOrganizing(false);
  };

  const handleDelete = async (fileName) => {
    if (!confirm(`Delete ${fileName}?`)) return;

    setDeletingFile(fileName);
    try {
      const response = await fetch(
        `${API_URL}/api/files/${encodeURIComponent(fileName)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchFiles();
      } else {
        alert(data.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    } finally {
      setDeletingFile(null);
    }
  };

  const handleMove = async (fileName, targetCategory) => {
    setIsMoving(true);
    try {
      const response = await fetch(`${API_URL}/api/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, targetCategory }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchFiles();
      } else {
        alert(data.error || "Failed to move file");
      }
    } catch (error) {
      console.error("Error moving file:", error);
      alert("Error moving file. Please try again.");
    } finally {
      setIsMoving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#007AFF] border-t-transparent"></div>
          </div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />

      {/* Loading states */}
      {isMoving && <Loader message="Moving file..." />}

      {showOrganizeAnimation && (
        <OrganizeAnimation
          files={organizingFiles}
          onComplete={handleAnimationComplete}
        />
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <FileUpload onFilesUploaded={handleFilesUploaded} />

        {files.length > 0 && (
          <div className="mt-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setView("grid")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      view === "grid"
                        ? "bg-[#007AFF] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    All Files
                  </button>
                  <button
                    onClick={() => setView("category")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      view === "category"
                        ? "bg-[#007AFF] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    By Category
                  </button>
                </div>

                <button
                  onClick={handleOrganize}
                  disabled={isOrganizing}
                  className="btn-primary flex items-center gap-2"
                >
                  {isOrganizing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Organizing...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>Organize Files</span>
                    </>
                  )}
                </button>
              </div>

              {view === "grid" ? (
                <FileGrid
                  files={files}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  deletingFile={deletingFile}
                />
              ) : (
                <CategoryView
                  categories={categories}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  deletingFile={deletingFile}
                />
              )}
            </div>
          </div>
        )}

        {files.length === 0 && !isLoading && (
          <div className="text-center py-16 mt-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm mb-4">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-600"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              No files yet
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Select a folder to get started
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-600"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="text-xs font-medium text-gray-600">
                Built by Team Mavericks
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
