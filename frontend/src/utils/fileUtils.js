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
