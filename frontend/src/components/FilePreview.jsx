import { useState } from "react";
import { getFilePreviewUrl, canPreviewAsThumb, canPreviewPdf } from "../utils/fileUtils";
import PdfThumbnail from "./PdfThumbnail";

const CATEGORY_ICONS = {
  Documents: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Images: null,
  Audio: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Videos: null,
  Archives: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  ),
  Code: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Others: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
};

/**
 * Small preview/thumbnail for a file: image thumb, video frame, or category icon.
 * Use in table, grid, and category views for consistency.
 */
export default function FilePreview({ file, size = "md", className = "" }) {
  const [thumbError, setThumbError] = useState(false);
  const url = getFilePreviewUrl(file);
  const showThumb = canPreviewAsThumb(file) && url && !thumbError;
  const category = file?.category || "Others";
  const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Others;

  const sizeClasses = {
    sm: "w-8 h-8 min-w-[32px] min-h-[32px]",
    md: "w-10 h-10 min-w-[40px] min-h-[40px]",
    lg: "w-14 h-14 min-w-[56px] min-h-[56px]",
    fill: "w-full h-full min-w-0 min-h-0",
  };
  const box = sizeClasses[size] || sizeClasses.md;

  if (showThumb && category === "Images") {
    return (
      <span className={`${box} rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center ${className}`}>
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setThumbError(true)}
        />
      </span>
    );
  }

  if (showThumb && category === "Videos") {
    return (
      <span className={`${box} rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center ${className}`}>
        <video
          src={url}
          className="w-full h-full object-cover"
          muted
          preload="metadata"
          onLoadedData={(e) => { try { e.target.currentTime = 0.5; } catch (_) {} }}
          onError={() => setThumbError(true)}
        />
      </span>
    );
  }

  if (canPreviewPdf(file) && url && !thumbError) {
    return (
      <span className={`${box} rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center ${className}`}>
        <PdfThumbnail url={url} className="w-full h-full" onError={() => setThumbError(true)} />
      </span>
    );
  }

  return (
    <span className={`${box} rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0 ${className}`}>
      {Icon ? <span className="w-1/2 h-1/2">{Icon}</span> : null}
    </span>
  );
}
