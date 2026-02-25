import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Upload & Browse",
    what: "Upload files or folders into the current directory. Use the sidebar and breadcrumbs to move around. Path is always relative to the app root.",
    os: "readdir(), mkdir(), path resolution. Backend normalizes paths and blocks traversal outside the root.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    title: "Organize by Type",
    what: "Click Organize on the root. Files are grouped by extension into folders: Documents, Images, Audio, Video, Code, Archives, Others.",
    os: "readdir(root), then for each file: get category from extension, mkdir(category) if needed, rename(file, category/file). Same as atomic move on disk.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <polyline points="22 12 16 12 14 15 10 15 10 12 2 12" />
      </svg>
    ),
  },
  {
    title: "Create, Rename, Copy, Move, Delete",
    what: "New folder: button in toolbar. Rename/copy/move/delete via row actions or right-click. Empty folders can be deleted.",
    os: "mkdir(), rename(), fs.copyFileSync(), unlink(), rmdir(). Delete folder uses readdir to confirm empty before rmdir.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    title: "Search",
    what: "Search box in the file manager. Matches file and folder names under the root. Results show path and type.",
    os: "Recursive readdir and name matching. Same idea as walking the tree with opendir/readdir.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: "Storage View",
    what: "Sidebar shows total size and per-category breakdown (size, file count, %). Same categories as Organize.",
    os: "readdir + stat() over the tree; sum size by category. Like du per directory.",
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
    what: "Table shows size and modified time. Click a file to see details; images, video, and PDF open in-app preview.",
    os: "stat() for size, mtime, birthtime. Preview is just streaming the file; no extra OS calls.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Download (Save to Disk)",
    what: "Download button on files. Browser gets the file with Content-Disposition: attachment so it saves instead of opening in a new tab.",
    os: "Path check, stat() to confirm it's a file, then createReadStream() and pipe to response. OS read in chunks.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
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
        <h1 className="text-4xl font-bold tracking-tight mb-3">How It Works</h1>
        <p className="text-white/60 text-lg mb-12">
          What you can do in the app and how it works under the hood. The backend uses Node.js (fs, path); all paths stay inside a single root.
        </p>

        <div className="space-y-8">
          {FEATURES.map((f) => (
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
                  <p className="text-white/70 mb-3">{f.what}</p>
                  <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-4 py-3">
                    <p className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-1">OS / Node</p>
                    <p className="text-sm text-white/80 font-mono">{f.os}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-white mb-2">What you can do</h2>
          <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
            <li>Upload files or folders and browse with the sidebar and breadcrumbs.</li>
            <li>Organize files by type into category folders (Documents, Images, etc.).</li>
            <li>Create folders, rename or copy files, move and delete files or empty folders.</li>
            <li>Search by name; see storage usage per category in the sidebar.</li>
            <li>Preview images, video, and PDF; download any file to save it to disk.</li>
          </ul>
        </div>

        <div className="mt-12 text-center">
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
