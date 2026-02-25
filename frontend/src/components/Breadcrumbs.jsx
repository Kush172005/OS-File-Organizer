export default function Breadcrumbs({ currentPath, onNavigate }) {
  const segments = currentPath ? currentPath.split("/").filter(Boolean) : [];
  return (
    <nav className="flex items-center gap-1 text-sm">
      <button
        type="button"
        onClick={() => onNavigate("")}
        className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 font-medium transition-colors"
      >
        Home
      </button>
      {segments.map((name, i) => {
        const path = segments.slice(0, i + 1).join("/");
        const label = name === "__all__" ? "All files" : name;
        return (
          <span key={path} className="flex items-center gap-1">
            <span className="text-slate-600">/</span>
            <button
              type="button"
              onClick={() => onNavigate(path)}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 font-medium truncate max-w-[140px] transition-colors"
            >
              {label}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
