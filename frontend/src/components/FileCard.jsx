import { useState } from 'react';
import { createPortal } from 'react-dom';

const FILE_ICONS = {
  Documents: { 
    color: 'from-blue-400 to-blue-500', 
    bg: 'bg-blue-50',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    )
  },
  Images: { 
    color: 'from-pink-400 to-pink-500', 
    bg: 'bg-pink-50',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    )
  },
  Audio: { 
    color: 'from-purple-400 to-purple-500', 
    bg: 'bg-purple-50',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    )
  },
  Videos: { 
    color: 'from-red-400 to-red-500', 
    bg: 'bg-red-50',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7"></polygon>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
      </svg>
    )
  },
  Archives: { 
    color: 'from-yellow-400 to-yellow-500', 
    bg: 'bg-yellow-50',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="21 8 21 21 3 21 3 8"></polyline>
        <rect x="1" y="3" width="22" height="5"></rect>
        <line x1="10" y1="12" x2="14" y2="12"></line>
      </svg>
    )
  },
  Code: { 
    color: 'from-green-400 to-green-500', 
    bg: 'bg-green-50',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    )
  },
  Others: { 
    color: 'from-gray-400 to-gray-500', 
    bg: 'bg-gray-50',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
    )
  },
};

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function FileCard({ file, onDelete, onMove, deletingFile }) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const categories = Object.keys(FILE_ICONS);
  const isDeleting = deletingFile === file.name;
  const fileConfig = FILE_ICONS[file.category];
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const isImage = file.category === 'Images';
  const isVideo = file.category === 'Videos';
  const thumbnailUrl = file.relativePath
    ? `${API_URL}/uploads/${encodeURI(file.relativePath)}`
    : null;

  const handleMove = async (category) => {
    setShowMoveMenu(false);
    await onMove(file.name, category);
  };

  const handleView = async () => {
    setShowModal(true);
    setLoadingDetails(true);
    try {
      const res = await fetch(`${API_URL}/api/files/${encodeURIComponent(file.name)}/details`);
      const data = await res.json();
      setFileDetails(data);
    } catch (err) {
      console.error('Failed to load file details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className={`relative group ${showMoveMenu ? 'z-50' : 'z-0'}`}>
      <div className={`card p-4 transition-all duration-200 ${isDeleting ? 'opacity-40 scale-95' : 'hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5'}`}>
        {/* Thumbnail / Icon header */}
        <div
          className={`w-full h-24 rounded-lg overflow-hidden ${fileConfig.bg} flex items-center justify-center mb-3 border border-gray-100 ${(isImage || isVideo) && thumbnailUrl ? 'cursor-pointer' : ''}`}
          onDoubleClick={() => { if ((isImage || isVideo) && thumbnailUrl) setShowFullscreen(true); }}
          title={(isImage || isVideo) && thumbnailUrl ? 'Double-click to view fullscreen' : ''}
        >
          {isImage && thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={file.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : isVideo && thumbnailUrl ? (
            <video
              src={thumbnailUrl}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
              onLoadedData={(e) => { e.target.currentTime = 1; }}
            />
          ) : (
            <div className="text-gray-600">
              {fileConfig.icon}
            </div>
          )}
        </div>
        
        {/* File info */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900 truncate mb-1.5" title={file.name}>
            {file.name}
          </h3>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${fileConfig.color} text-white text-xs font-medium shadow-sm`}>
            <span>{file.category}</span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          {/* View button - only for images and videos */}
          {(isImage || isVideo) && (
            <button
              onClick={handleView}
              disabled={isDeleting}
              className="flex-1 text-xs btn-secondary disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>View</span>
            </button>
          )}
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            disabled={isDeleting}
            className="flex-1 text-xs btn-secondary disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <span>Move</span>
          </button>
          <button
            onClick={() => onDelete(file.name)}
            disabled={isDeleting}
            className="flex-1 text-xs btn-danger disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isDeleting ? (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
        
        {/* Move menu dropdown */}
        {showMoveMenu && !isDeleting && (
          <div className="absolute top-full left-0 right-0 mt-2 card p-2 z-50 shadow-xl max-h-60 overflow-y-auto animate-scaleIn">
            {categories.map(category => {
              const catConfig = FILE_ICONS[category];
              return (
                <button
                  key={category}
                  onClick={() => handleMove(category)}
                  disabled={category === file.category}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 transition-all ${
                    category === file.category
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="scale-[0.6] text-gray-600">
                      {catConfig.icon}
                    </div>
                  </div>
                  <span className="flex-1 font-medium">{category}</span>
                  {category === file.category && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* View Details Modal — rendered via portal to escape stacking context */}
      {showModal && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 bg-gradient-to-r ${fileConfig.color} flex items-center justify-between`}>
              <h2 className="text-white font-bold text-base truncate pr-4">{file.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Preview Area */}
            <div className="w-full bg-gray-950 flex items-center justify-center" style={{ maxHeight: '320px' }}>
              {isImage && thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={file.name}
                  className="max-w-full max-h-80 object-contain"
                />
              ) : isVideo && thumbnailUrl ? (
                <video
                  src={thumbnailUrl}
                  className="max-w-full max-h-80"
                  controls
                  muted
                  preload="metadata"
                />
              ) : null}
            </div>

            {/* Details */}
            <div className="px-6 py-5">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-6">
                  <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : fileDetails ? (
                <div className="space-y-3">
                  <DetailRow
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                    }
                    label="File Name"
                    value={fileDetails.name}
                  />
                  <DetailRow
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                    }
                    label="Size"
                    value={formatFileSize(fileDetails.size)}
                  />
                  <DetailRow
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    }
                    label="Created At"
                    value={formatDate(fileDetails.createdAt)}
                  />
                  <DetailRow
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    }
                    label="Modified At"
                    value={formatDate(fileDetails.modifiedAt)}
                  />
                  <DetailRow
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                    }
                    label="Type"
                    value={`${fileDetails.extension.toUpperCase().replace('.', '')} — ${fileDetails.category}`}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Could not load file details.</p>
              )}
            </div>
          </div>
        </div>
      , document.body)}

      {/* Fullscreen Lightbox — double-click opens this */}
      {showFullscreen && thumbnailUrl && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
          onClick={() => setShowFullscreen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowFullscreen(false); }}
          tabIndex={0}
          ref={(el) => el && el.focus()}
          style={{ outline: 'none' }}
        >
          {/* Close button */}
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors z-10"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* File name */}
          <div className="absolute top-5 left-5 text-white/70 text-sm font-medium truncate max-w-[60%]">
            {file.name}
          </div>

          {isImage ? (
            <img
              src={thumbnailUrl}
              alt={file.name}
              className="max-w-[95vw] max-h-[95vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              src={thumbnailUrl}
              className="max-w-[95vw] max-h-[95vh]"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      , document.body)}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100">
      <div className="text-gray-400 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-800 font-semibold truncate" title={value}>{value}</p>
      </div>
    </div>
  );
}

export default FileCard;
