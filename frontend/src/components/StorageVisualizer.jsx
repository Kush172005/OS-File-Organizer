import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CATEGORY_COLORS = {
  Documents: { bg: 'from-blue-400 to-blue-600', bar: '#3B82F6', light: 'rgba(59,130,246,0.12)' },
  Images: { bg: 'from-pink-400 to-pink-600', bar: '#EC4899', light: 'rgba(236,72,153,0.12)' },
  Audio: { bg: 'from-purple-400 to-purple-600', bar: '#A855F7', light: 'rgba(168,85,247,0.12)' },
  Videos: { bg: 'from-red-400 to-red-600', bar: '#EF4444', light: 'rgba(239,68,68,0.12)' },
  Archives: { bg: 'from-yellow-400 to-yellow-600', bar: '#F59E0B', light: 'rgba(245,158,11,0.12)' },
  Code: { bg: 'from-green-400 to-green-600', bar: '#22C55E', light: 'rgba(34,197,94,0.12)' },
  Others: { bg: 'from-gray-400 to-gray-600', bar: '#6B7280', light: 'rgba(107,114,128,0.12)' },
};

const CATEGORY_ICONS = {
  Documents: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Images: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Audio: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Videos: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Archives: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  ),
  Code: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Others: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  ),
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function StorageVisualizer() {
  const [storageData, setStorageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStorage();
  }, []);

  const fetchStorage = async () => {
    try {
      const response = await fetch(`${API_URL}/api/storage`);
      const data = await response.json();
      setStorageData(data);
    } catch (err) {
      console.error('Error fetching storage:', err);
      setError('Failed to load storage data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-700 mb-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-400 border-t-transparent"></div>
        </div>
        <p className="text-sm text-slate-400">Calculating storage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const categories = storageData?.categories || {};
  const totalSize = storageData?.totalSize || 0;
  const sortedCategories = Object.entries(categories).sort((a, b) => b[1].size - a[1].size);
  const totalFiles = sortedCategories.reduce((acc, [, data]) => acc + data.fileCount, 0);

  if (sortedCategories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-700 mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <path d="M7 10h10M7 14h6" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">No storage data</h3>
        <p className="text-xs text-slate-500">Upload some files to see storage breakdown</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Total storage summary */}
      <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-200">Total Storage</h2>
              <p className="text-xs text-slate-500">{totalFiles} file{totalFiles !== 1 ? 's' : ''} across {sortedCategories.length} categor{sortedCategories.length !== 1 ? 'ies' : 'y'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-200">{formatBytes(totalSize)}</p>
            <p className="text-xs text-slate-500">used</p>
          </div>
        </div>

        {/* Combined progress bar */}
        <div className="h-4 rounded-full overflow-hidden flex bg-slate-700">
          {sortedCategories.map(([category, data], idx) => {
            const percentage = totalSize > 0 ? (data.size / totalSize) * 100 : 0;
            const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Others;
            return (
              <div
                key={category}
                className="h-full transition-all duration-700 ease-out relative group"
                style={{
                  width: `${Math.max(percentage, 1.5)}%`,
                  backgroundColor: colors.bar,
                  animationDelay: `${idx * 100}ms`,
                }}
                title={`${category}: ${formatBytes(data.size)} (${percentage.toFixed(1)}%)`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {sortedCategories.map(([category]) => {
            const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Others;
            return (
              <div key={category} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors.bar }} />
                <span className="text-xs text-slate-400">{category}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Block-style category cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedCategories.map(([category, data], idx) => {
          const percentage = totalSize > 0 ? (data.size / totalSize) * 100 : 0;
          const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Others;
          const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Others;

          return (
            <div
              key={category}
              className="p-4 bg-slate-800 rounded-2xl border border-slate-700/80 hover:border-slate-600 transition-all duration-300 cursor-default animate-scaleIn group relative overflow-hidden"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Background decoration */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50"
                style={{ backgroundColor: colors.bar, transform: 'translate(30%, -30%)' }}
              />

              {/* Icon + category name */}
              <div className="flex items-center gap-2.5 mb-3 relative z-10">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${colors.bg} text-white shadow-sm`}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-200 truncate">{category}</h3>
                  <p className="text-xs text-slate-500">
                    {data.fileCount} file{data.fileCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Size */}
              <div className="mb-3 relative z-10">
                <p className="text-xl font-bold text-slate-200">{formatBytes(data.size)}</p>
                <p className="text-xs font-medium" style={{ color: colors.bar }}>
                  {percentage.toFixed(1)}% of total
                </p>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full overflow-hidden bg-slate-700 relative z-10">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colors.bar,
                    minWidth: percentage > 0 ? '4px' : '0',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed breakdown table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200">Detailed Breakdown</h3>
        </div>
        <div className="divide-y divide-slate-700/60">
          {sortedCategories.map(([category, data], idx) => {
            const percentage = totalSize > 0 ? (data.size / totalSize) * 100 : 0;
            const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Others;
            const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Others;

            return (
              <div
                key={category}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-700/40 transition-colors animate-slideRight"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg} text-white shadow-sm flex-shrink-0`}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium text-slate-200">{category}</span>
                    <span className="text-sm font-semibold text-slate-200 ml-2">{formatBytes(data.size)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-700">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colors.bar,
                          minWidth: percentage > 0 ? '3px' : '0',
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-14 text-right flex-shrink-0">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500 w-12 text-right flex-shrink-0">
                      {data.fileCount} file{data.fileCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StorageVisualizer;
