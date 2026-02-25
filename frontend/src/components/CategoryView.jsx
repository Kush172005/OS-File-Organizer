import FileCard from './FileCard';

const FILE_ICONS = {
  Documents: { 
    color: 'from-blue-400 to-blue-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    )
  },
  Images: { 
    color: 'from-pink-400 to-pink-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    )
  },
  Audio: { 
    color: 'from-purple-400 to-purple-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    )
  },
  Videos: { 
    color: 'from-red-400 to-red-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <polygon points="23 7 16 12 23 17 23 7"></polygon>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
      </svg>
    )
  },
  Archives: { 
    color: 'from-yellow-400 to-yellow-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <polyline points="21 8 21 21 3 21 3 8"></polyline>
        <rect x="1" y="3" width="22" height="5"></rect>
        <line x1="10" y1="12" x2="14" y2="12"></line>
      </svg>
    )
  },
  Code: { 
    color: 'from-green-400 to-green-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    )
  },
  Others: { 
    color: 'from-gray-400 to-gray-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
    )
  },
};

function CategoryView({ categories, onDelete, onMove, deletingFile }) {
  const categoryKeys = Object.keys(categories);

  if (categoryKeys.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-700 mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">No organized files</h3>
        <p className="text-xs text-slate-500">Click "Organize Files" to sort by category</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categoryKeys.map((category, idx) => {
        const catConfig = FILE_ICONS[category];
        return (
          <div key={category} className="p-6 bg-slate-800 rounded-2xl border border-slate-700/80 animate-slideUp hover:border-slate-600 transition-shadow" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${catConfig.color} shadow-sm`}>
                {catConfig.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-200">{category}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {categories[category].length} file{categories[category].length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${catConfig.color} text-white text-xs font-semibold shadow-sm`}>
                {categories[category].length}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories[category].map((file) => (
                <FileCard
                  key={file.name}
                  file={file}
                  onDelete={onDelete}
                  onMove={onMove}
                  deletingFile={deletingFile}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CategoryView;
