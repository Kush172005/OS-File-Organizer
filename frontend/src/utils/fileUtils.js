/**
 * Format file size like system file managers (Finder / Explorer).
 * 0 B, 512 B, 1.5 KB, 2.3 MB, 1.2 GB
 */
export function formatFileSize(bytes) {
  if (bytes == null || bytes === undefined) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  const formatted = value >= 100 || value % 1 === 0 ? Math.round(value) : value.toFixed(2);
  return `${formatted} ${sizes[i]}`;
}

export function formatModifiedDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3001";

export function getFilePreviewUrl(file) {
  if (!file?.relativePath) return null;
  return `${API_URL}/uploads/${encodeURI(file.relativePath)}`;
}

export function canPreviewAsThumb(file) {
  const cat = file?.category || "";
  return cat === "Images" || cat === "Videos";
}

export function isPdf(file) {
  if (!file?.name) return false;
  return file.name.toLowerCase().endsWith(".pdf");
}

export function canPreviewPdf(file) {
  return isPdf(file);
}

/** Sort options like file system: name, date, size, type. */
export const SORT_OPTIONS = [
  { id: "name-asc", label: "Name (A–Z)", by: "name", order: "asc" },
  { id: "name-desc", label: "Name (Z–A)", by: "name", order: "desc" },
  { id: "date-desc", label: "Date modified (newest)", by: "date", order: "desc" },
  { id: "date-asc", label: "Date modified (oldest)", by: "date", order: "asc" },
  { id: "size-desc", label: "Size (largest)", by: "size", order: "desc" },
  { id: "size-asc", label: "Size (smallest)", by: "size", order: "asc" },
  { id: "type-asc", label: "Type (category)", by: "type", order: "asc" },
  { id: "type-desc", label: "Type (Z–A)", by: "type", order: "desc" },
];

/**
 * Sort folders and files for file-manager display.
 * Folders are always listed before files when sorting by name or type; then by the chosen field.
 * - name: alphabetical by name (folders first)
 * - date: by modified date (folders use modifiedAt, files use modifiedAt)
 * - size: by size (folders use totalSize, files use size; folders first for type)
 * - type: by category/type (folders first, then file category)
 */
export function sortFoldersAndFiles(folders, files, sortBy, sortOrder) {
  const asc = sortOrder === "asc";
  const folderList = Array.isArray(folders) ? [...folders] : [];
  const fileList = Array.isArray(files) ? [...files] : [];

  const cmp = (a, b) => {
    if (a === b) return 0;
    return (a < b ? -1 : 1) * (asc ? 1 : -1);
  };
  const numCmp = (a, b) => {
    const na = Number(a) || 0;
    const nb = Number(b) || 0;
    return (na - nb) * (asc ? 1 : -1);
  };
  const dateCmp = (a, b) => {
    const ta = a ? new Date(a).getTime() : 0;
    const tb = b ? new Date(b).getTime() : 0;
    return (ta - tb) * (asc ? 1 : -1);
  };

  if (sortBy === "name") {
    folderList.sort((a, b) => cmp((a.name || "").toLowerCase(), (b.name || "").toLowerCase()));
    fileList.sort((a, b) => cmp((a.name || "").toLowerCase(), (b.name || "").toLowerCase()));
    return { folders: folderList, files: fileList };
  }
  if (sortBy === "date") {
    folderList.sort((a, b) => dateCmp(a.modifiedAt, b.modifiedAt) || cmp(a.name || "", b.name || ""));
    fileList.sort((a, b) => dateCmp(a.modifiedAt, b.modifiedAt) || cmp(a.name || "", b.name || ""));
    return { folders: folderList, files: fileList };
  }
  if (sortBy === "size") {
    folderList.sort((a, b) => numCmp(a.totalSize, b.totalSize) || cmp(a.name || "", b.name || ""));
    fileList.sort((a, b) => numCmp(a.size, b.size) || cmp(a.name || "", b.name || ""));
    return { folders: folderList, files: fileList };
  }
  if (sortBy === "type") {
    folderList.sort((a, b) => cmp((a.name || "").toLowerCase(), (b.name || "").toLowerCase()));
    fileList.sort((a, b) => cmp((a.category || "").toLowerCase(), (b.category || "").toLowerCase()) || cmp((a.name || "").toLowerCase(), (b.name || "").toLowerCase()));
    return { folders: folderList, files: fileList };
  }
  return { folders: folderList, files: fileList };
}

/** Sort a flat list of files only (e.g. for "All files" view). */
export function sortFilesOnly(files, sortBy, sortOrder) {
  const list = Array.isArray(files) ? [...files] : [];
  const asc = sortOrder === "asc";
  const cmp = (a, b) => ((a < b ? -1 : a > b ? 1 : 0) * (asc ? 1 : -1));
  const numCmp = (a, b) => ((Number(a) || 0) - (Number(b) || 0)) * (asc ? 1 : -1);
  const dateCmp = (a, b) => ((new Date(a || 0).getTime() - new Date(b || 0).getTime()) * (asc ? 1 : -1));

  if (sortBy === "name") list.sort((a, b) => cmp((a.name || "").toLowerCase(), (b.name || "").toLowerCase()));
  else if (sortBy === "date") list.sort((a, b) => dateCmp(a.modifiedAt, b.modifiedAt) || cmp(a.name || "", b.name || ""));
  else if (sortBy === "size") list.sort((a, b) => numCmp(a.size, b.size) || cmp(a.name || "", b.name || ""));
  else if (sortBy === "type") list.sort((a, b) => cmp((a.category || "").toLowerCase(), (b.category || "").toLowerCase()) || cmp(a.name || "", b.name || ""));
  return list;
}
