import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Upload & Browse",
    description: "Upload files or entire folders. Browse the directory tree like a real file manager. Uploads can target a specific folder.",
    osConcept: "Demonstrates readdir(), mkdir(), and path resolution — how the OS organizes files in a hierarchy.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    title: "Auto-Categorize by Type",
    description: "Files are classified by extension (Documents, Images, Audio, Video, Code, Archives). One-click organize moves files into category folders.",
    osConcept: "Uses file metadata (extension) and rename() — how the OS identifies file types and moves data on disk.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <polyline points="22 12 16 12 14 15 10 15 10 12 2 12" />
      </svg>
    ),
  },
  {
    title: "Create, Rename, Copy, Delete",
    description: "Create new folders, rename files or folders, copy files to another folder, delete files. Empty folders can be removed.",
    osConcept: "Maps to mkdir(), rename(), copyFile(), unlink(), rmdir() — core OS file system operations.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    title: "Search",
    description: "Search files and folders by name across the entire tree. Results show location and type.",
    osConcept: "Directory traversal and string matching — how tools like find() walk the file system.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: "Storage View",
    description: "See storage usage per category: total size, file count, and percentage. Visual breakdown of how space is used.",
    osConcept: "Uses stat() for size and aggregates by category — how the OS reports disk usage and metadata.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "File Details & Preview",
    description: "View file metadata (size, created, modified, type). Preview images and videos in-app.",
    osConcept: "Demonstrates stat() (birthtime, mtime, size) — how the OS stores and serves file attributes.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="w-10 h-10 rounded-xl shadow-lg shadow-indigo-500/25" />
            <span className="font-semibold text-lg">File Organizer</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm text-white/70 hover:text-white transition-colors">Home</Link>
            <Link to="/app" className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors font-medium">Open App</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-indigo-400 font-medium text-sm tracking-wide uppercase mb-2">What it does</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Features & OS Concepts</h1>
        <p className="text-white/60 text-lg mb-14">
          Every feature is tied to how operating systems handle file storage and categorization. Use this to explain the "why" in your evaluation.
        </p>

        <div className="space-y-10">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  {f.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-white mb-2">{f.title}</h2>
                  <p className="text-white/70 mb-4">{f.description}</p>
                  <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-4 py-3">
                    <p className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-1">OS concept</p>
                    <p className="text-sm text-white/80">{f.osConcept}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all"
          >
            Open File Organizer
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/5 py-6 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-white/40">
          Team Mavericks — Operating Systems Project
        </div>
      </footer>
    </div>
  );
}
