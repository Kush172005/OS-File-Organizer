import { useEffect, useState } from 'react';

const FILE_ICONS = {
  Documents: { 
    color: 'from-blue-400 to-blue-500',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    )
  },
  Images: { 
    color: 'from-pink-400 to-pink-500',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    )
  },
  Audio: { 
    color: 'from-purple-400 to-purple-500',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    )
  },
  Videos: { 
    color: 'from-red-400 to-red-500',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7"></polygon>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
      </svg>
    )
  },
  Archives: { 
    color: 'from-yellow-400 to-yellow-500',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="21 8 21 21 3 21 3 8"></polyline>
        <rect x="1" y="3" width="22" height="5"></rect>
      </svg>
    )
  },
  Code: { 
    color: 'from-green-400 to-green-500',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    )
  },
  Others: { 
    color: 'from-gray-400 to-gray-500',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
    )
  },
};

function OrganizeAnimation({ files, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < files.length) {
      const timer = setTimeout(() => {
        setProcessedFiles(prev => [...prev, files[currentIndex]]);
        setCurrentIndex(currentIndex + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else if (currentIndex === files.length && files.length > 0) {
      const completeTimer = setTimeout(() => {
        setIsComplete(true);
        setTimeout(onComplete, 1200);
      }, 600);
      return () => clearTimeout(completeTimer);
    }
  }, [currentIndex, files.length, onComplete]);

  const currentFile = files[currentIndex];
  const progress = files.length > 0 ? (currentIndex / files.length) * 100 : 0;

  // Group processed files by category
  const categories = {};
  processedFiles.forEach(file => {
    if (!categories[file.category]) {
      categories[file.category] = [];
    }
    categories[file.category].push(file);
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isComplete ? 'Organization Complete' : 'Organizing Files'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isComplete 
                  ? `Successfully organized ${files.length} files`
                  : `${currentIndex} of ${files.length} files processed`
                }
              </p>
            </div>
            {!isComplete && (
              <div className="text-2xl animate-pulse">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#007AFF]">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            )}
            {isComplete && (
              <div className="text-2xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#34C759]">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-[#007AFF] h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Current file being processed */}
          {currentFile && !isComplete && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-slideUp">
              <div className="flex items-center gap-3">
                <div className="text-blue-600 file-moving">
                  {FILE_ICONS[currentFile.category].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{currentFile.name}</p>
                  <p className="text-xs text-gray-500">Moving to {currentFile.category}</p>
                </div>
                <svg className="animate-spin h-4 w-4 text-[#007AFF]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
          )}

          {/* Category sections */}
          {Object.keys(categories).length > 0 && (
            <div className="space-y-4">
              {Object.keys(categories).map((category, idx) => (
                <div 
                  key={category} 
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 animate-slideRight"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-gray-600">{FILE_ICONS[category].icon}</div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">{category}</h3>
                      <p className="text-xs text-gray-500">
                        {categories[category].length} file{categories[category].length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    {categories[category].map((file, fileIdx) => (
                      <div
                        key={file.name}
                        className="bg-white rounded px-3 py-2 text-xs text-gray-700 truncate border border-gray-200 animate-slideRight"
                        style={{ animationDelay: `${fileIdx * 30}ms` }}
                      >
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completion message */}
          {isComplete && (
            <div className="text-center py-8 animate-scaleIn">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#34C759]">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                All files organized
              </h3>
              <p className="text-sm text-gray-500">
                {files.length} files sorted into {Object.keys(categories).length} categories
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrganizeAnimation;
