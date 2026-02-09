import { useEffect } from 'react';

function ImagePreviewModal({ file, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!file) return null;

  const getFileUrl = (filePath) => {

    const fileName = filePath.split(/[\\/]/).pop();
    // Start with the category if it exists in the path, otherwise just filename
    if (file.url) {
        return file.url.startsWith('http') ? file.url : `http://localhost:3001${file.url}`;
    }
    const category = file.category || 'Others';
    return `http://localhost:3001/uploads/${category}/${encodeURIComponent(file.name)}`;
  };

  const imageUrl = getFileUrl(file.path);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Adhere to design: Premium look */}
        
        {/* Image Section */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 min-h-[300px] md:min-h-[500px]">
          <img 
            src={imageUrl} 
            alt={file.name} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-80 p-6 flex flex-col border-l border-gray-100 bg-white">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-800">File Details</h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
              <p className="text-sm font-medium text-gray-900 break-all">{file.name}</p>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</label>
              <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {file.category}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</label>
              <p className="text-sm text-gray-600">{file.name.split('.').pop().toUpperCase()}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Size</label>
              <p className="text-sm text-gray-600">{file.size || 'Unknown'}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</label>
              <p className="text-sm text-gray-600">
                {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            
             <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</label>
              <p className="text-xs text-gray-500 break-all font-mono mt-1 bg-gray-50 p-2 rounded">{file.path}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImagePreviewModal;
