import { useState } from 'react';
import { createPortal } from 'react-dom';
import ImagePreviewModal from './ImagePreviewModal';

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

function FileCard({ file, onDelete, onMove, deletingFile }) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const categories = Object.keys(FILE_ICONS);
  const isDeleting = deletingFile === file.name;
  const fileConfig = FILE_ICONS[file.category];
  const [showPreview, setShowPreview] = useState(false);
  
  // Check if file is an image based on extension or category
  const isImage = ['Images', 'Others'].includes(file.category) && 
    ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].some(ext => file.name.toLowerCase().endsWith(ext));
    
  // Use the URL provided by backend
  const imageUrl = file.url ? `http://localhost:3001${file.url}` : '';

  const handleMove = async (category) => {
    setShowMoveMenu(false);
    await onMove(file.name, category);
  };

  return (
    <div className={`relative group ${showMoveMenu ? 'z-50' : 'z-0'}`}>
      <div className={`card p-4 transition-all duration-200 ${isDeleting ? 'opacity-40 scale-95' : 'hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5'}`}>
        {/* Icon header with gradient background */}
        <div className={`w-full h-24 rounded-lg flex items-center justify-center mb-3 border border-gray-100 overflow-hidden ${isImage ? 'bg-gray-100' : fileConfig.bg}`}>
          {isImage && imageUrl ? (
            <img 
              src={imageUrl} 
              alt={file.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block'; // Show icon if image fails
              }}
            />
          ) : null}
          <div className="text-gray-600" style={{ display: isImage && imageUrl ? 'none' : 'block' }}>
            {fileConfig.icon}
          </div>
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
          
          {isImage && (
            <button
              onClick={() => setShowPreview(true)}
              disabled={isDeleting}
              className="flex-1 text-xs btn-primary disabled:opacity-50 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>View</span>
            </button>
          )}

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
        
        {/* Move menu dropdown - with higher z-index */}
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

      
      {showPreview && createPortal(
        <ImagePreviewModal file={{...file, url: imageUrl}} onClose={() => setShowPreview(false)} />,
        document.body
      )}
    </div>
  );
}

export default FileCard;
