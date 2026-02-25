export default function Breadcrumbs({ currentPath, onNavigate }) {
  const segments = currentPath ? currentPath.split("/").filter(Boolean) : [];
  return (
    <nav className="flex items-center gap-1 text-sm">
      <button
        type="button"
        onClick={() => onNavigate("")}
        className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-medium"
      >
        Home
      </button>
      {segments.map((name, i) => {
        const path = segments.slice(0, i + 1).join("/");
        const label = name === "__all__" ? "All files" : name;
        return (
          <span key={path} className="flex items-center gap-1">
            <span className="text-gray-400">/</span>
            <button
              type="button"
              onClick={() => onNavigate(path)}
              className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-medium truncate max-w-[120px]"
            >
              {label}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
