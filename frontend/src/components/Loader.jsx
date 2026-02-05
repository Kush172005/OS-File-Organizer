function Loader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-scaleIn">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Message */}
          <p className="text-sm font-medium text-gray-900 text-center">{message}</p>
          <p className="text-xs text-gray-500 mt-1">Please wait...</p>
        </div>
      </div>
    </div>
  );
}

export default Loader;
