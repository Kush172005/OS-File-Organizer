import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="w-10 h-10 rounded-xl shadow-lg shadow-indigo-500/25" />
            <span className="font-semibold text-lg">File Organizer</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/features" className="text-sm text-white/70 hover:text-white transition-colors">Features</Link>
            <Link to="/app" className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors font-medium">Open App</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-3xl">
          <p className="text-indigo-400 font-medium text-sm tracking-wide uppercase mb-4">OS Project — File System Management</p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Organize files like your OS does.
          </h1>
          <p className="text-xl text-white/60 leading-relaxed mb-10">
            Upload, browse, categorize, and manage files with a workflow that mirrors how operating systems handle file storage, directories, and metadata.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02]"
            >
              Open File Organizer
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* Preview mock */}
        <div className="mt-20 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <img src="/favicon.svg" alt="" className="ml-2 w-5 h-5 rounded opacity-70" />
            <span className="ml-2 text-white/50 text-sm">File Organizer</span>
          </div>
          <div className="flex">
            <aside className="w-52 border-r border-white/10 p-3 space-y-1">
              {["Documents", "Images", "Videos", "Audio", "Code", "Archives"].map((name, i) => (
                <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 text-sm hover:bg-white/5 cursor-pointer" style={{ opacity: 1 - i * 0.05 }}>
                  <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  {name}
                </div>
              ))}
            </aside>
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2 text-white/50 text-sm mb-4">Home / Documents</div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="rounded-lg bg-white/5 border border-white/10 p-4 h-24 flex flex-col items-center justify-center gap-1">
                    <img src="/favicon.svg" alt="" className="w-10 h-10 rounded-lg opacity-50" />
                    <span className="text-xs text-white/50 truncate w-full text-center">file_{n}.pdf</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-white/40">
          <span>Operating Systems Project — File System Management</span>
          <span>Team Mavericks</span>
        </div>
      </footer>
    </div>
  );
}
