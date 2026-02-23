# File Organizer — Operating Systems Project

A **full-stack file organizer** (backend API + web UI) that demonstrates **File System Management** concepts in Operating Systems. Upload, browse, categorize, search, rename, copy, and delete files with a workflow that mirrors how the OS handles file storage and directories.

---

## B1. Architecture & Workflow

### System design

- **Backend (Node.js + Express)**: REST API over the project’s upload directory. All file operations use the Node.js `fs` (and `path`) APIs, which map to OS system calls. This choice gives a direct, traceable link to OS behaviour (e.g. `readdir`, `rename`, `mkdir`, `stat`, `copyFile`, `unlink`, `rmdir`).
- **Frontend (React + Vite)**: Single-page app with routing (Landing → Features → File Manager). The file manager uses a **path-based browse** model: the UI shows a current directory path, and the backend returns folders and files for that path. This mirrors the OS idea of “current directory” and hierarchical paths.
- **Sync primitives**: No custom kernel sync primitives; the app relies on the OS’s own serialisation of file system calls (e.g. `rename` is atomic at the OS level). Concurrency is handled by the single Node process and the non-blocking async `fs` API.

### Why this design?

- **Path-based browsing**: Aligns with how the OS represents the file tree (paths, directories, entries). The `/api/browse?path=...` endpoint is the “read directory” abstraction.
- **Category-based organization**: File type (extension) drives suggested folders (Documents, Images, etc.). “Organize” uses `rename()` to move files into category folders, demonstrating how the OS moves data by path.
- **Single upload root**: All files live under one root directory (e.g. `backend/uploads`). Path resolution is normalized and validated to avoid directory traversal, similar to how an OS constrains processes to a subtree.

---

## B2. Alignment & Kickoff

Core features defined for a file organizer and how they are implemented:

| Kickoff feature        | Implementation                                                                 |
|------------------------|----------------------------------------------------------------------------------|
| Upload files/folders   | `POST /api/upload` (optional `?folder=` to upload into a path)                  |
| Browse by folder       | `GET /api/browse?path=...` — list folders and files at a given path             |
| Organize by type       | `POST /api/organize` — move root-level files into category folders by extension |
| View by category       | `GET /api/files` returns categories; UI has “Category” and “Storage” views      |
| Move / delete files    | `POST /api/move`, `DELETE /api/files/:fileName` (optional `?path=` for location) |
| Create folders         | `POST /api/folders` — create directory at a path                               |
| Rename                 | `PUT /api/rename` — rename file or folder                                      |
| Copy                   | `POST /api/copy` — copy file to another folder                                |
| Search                 | `GET /api/search?q=...` — search by name across the tree                       |
| Storage view           | `GET /api/storage` — size and count per category                               |
| File details / preview | `GET /api/files/:name/details`; UI preview for images/videos |
| Download (save to disk) | `GET /api/download?path=...` — streams file with `Content-Disposition: attachment` |

---

## B3. GitHub History

The repository is developed with **incremental commits** that reflect the workflow:

- Initial setup (backend + frontend, upload, list, organize).
- Addition of move, delete, file details, storage API.
- Addition of browse-by-path, create folder, rename, copy, search.
- UI: landing page, features page, file manager with sidebar, breadcrumbs, table/grid views, search.

Commits should show feature-by-feature progression rather than a single “final upload”.

---

## B4. Readability & Tools

- **Makefile**: Ease of build and run.
  - `make help` — list targets  
  - `make install` — install backend + frontend dependencies  
  - `make run-backend` — start API server (port 3001)  
  - `make run-frontend` — start frontend dev server (port 5173)  
  - `make build` — build frontend for production  
  - `make test` — run backend API test script  

- **Shell script**: `backend/test-api.sh` — exercises API endpoints (files, upload, organize, move, delete, etc.) for quick validation. Run with backend up: `./backend/test-api.sh` or `make test`.

- **Debugging**: Backend is Node.js; use `node --inspect server.js` and Chrome DevTools or VS Code’s Node debugger. For frontend, use browser DevTools and React DevTools.

---

## What is File System Management?

**File System Management** is the part of the OS that handles how data is stored, organized, and retrieved on storage. It provides an abstraction (files, directories, paths) between applications and the physical device.

### Responsibilities

1. **File organization** — Directories and hierarchy  
2. **File operations** — Create, read, update, delete  
3. **Path resolution** — Relative/absolute paths to physical locations  
4. **Metadata** — Size, type, timestamps  
5. **Space** — Allocation and usage

---

## How This App Maps to OS Concepts

### 1. File system operations

- **Directory listing**: `GET /api/browse` uses `fs.readdir(..., { withFileTypes: true })` (OS: `readdir()`).
- **Create directory**: `POST /api/folders` uses `fs.mkdir(..., { recursive: true })` (OS: `mkdir()`).
- **Move/rename**: `POST /api/move`, `PUT /api/rename` use `fs.rename()` (OS: `rename()`).
- **Copy**: `POST /api/copy` uses `fs.copyFile()` (read + write at OS level).
- **Delete file**: `DELETE /api/files` uses `fs.unlink()` (OS: `unlink()`).
- **Delete folder**: `DELETE /api/folders` uses `fs.rmdir()` (OS: `rmdir()`).
- **Metadata**: `GET /api/files/:name/details`, `GET /api/storage` use `fs.stat()` (size, birthtime, mtime).

### 2. System calls (Node `fs` → OS)

| Node.js       | OS / Purpose              |
|---------------|---------------------------|
| `fs.readdir()`| Read directory entries    |
| `fs.mkdir()`  | Create directory          |
| `fs.rename()` | Move/rename               |
| `fs.copyFile()` | Copy file               |
| `fs.unlink()` | Delete file               |
| `fs.rmdir()`  | Remove empty directory    |
| `fs.stat()`   | File metadata             |
| `fs.access()`| Existence/permissions     |

### 3. Path resolution

- Backend resolves all paths relative to a single upload root.
- Paths are normalized and checked to prevent directory traversal (no `..` outside the root).
- Cross-platform paths use `path.join` and `path.normalize`.

### 4. File classification

- Categories (Documents, Images, Audio, Videos, Archives, Code, Others) are derived from **file extension** (metadata).
- “Organize” moves files into folders by this classification using `rename()`.

---

## Project structure

```
file-organizer/
├── backend/
│   ├── server.js       # Express API, all file operations
│   ├── uploads/         # Default upload root (created at runtime)
│   ├── test-api.sh     # API test script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Router (/, /features, /app)
│   │   ├── pages/            # Landing, Features, FileManager
│   │   └── components/       # FileUpload, Sidebar, Toolbar, Table, etc.
│   └── package.json
├── .github/workflows/ci.yml  # CI (frontend build)
├── Makefile                  # install, run, build, test
└── README.md
```

---

## How to run

### Prerequisites

- Node.js (v18+ recommended)

### Quick start

```bash
cd file-organizer
make install
make run-backend    # Terminal 1: API on http://localhost:3001
make run-frontend   # Terminal 2: UI on http://localhost:5173
```

Then open **http://localhost:5173** — Landing → **Open File Organizer** or **Open App** → File Manager.

### Manual

```bash
# Backend
cd backend && npm install && node server.js

# Frontend (another terminal)
cd frontend && npm install && npm run dev
```

### Production build

```bash
make build   # or: cd frontend && npm run build
# Serve frontend/dist with any static server; point API to backend (e.g. VITE_API_URL).
```

---

## File categorization rules

| Category   | Extensions (examples) |
|-----------|------------------------|
| Documents | .pdf, .doc, .docx, .txt, .md |
| Images    | .jpg, .jpeg, .png, .gif, .svg, .webp |
| Audio     | .mp3, .wav, .ogg, .m4a |
| Videos    | .mp4, .mkv, .avi, .mov, .webm |
| Archives  | .zip, .rar, .7z, .tar, .gz |
| Code      | .js, .jsx, .ts, .tsx, .py, .java, .cpp, .c, .html, .css |
| Others    | Everything else |

---

## Safety and robustness

- **Path validation**: No directory traversal; paths are constrained to the upload root.
- **Duplicate handling**: Move/copy can report or skip when the destination already exists.
- **Empty folders**: Delete folder only when empty (`rmdir`).
- **Async I/O**: Non-blocking `fs` calls with error handling and HTTP status codes.

---

## OS concepts summary (for evaluation)

1. **File system hierarchy** — Directories and paths in the UI and API.  
2. **System calls** — All operations go through `fs` (readdir, mkdir, rename, stat, etc.).  
3. **Path resolution** — Normalized, safe paths relative to one root.  
4. **Metadata** — Extension, size, created/modified time from `stat()`.  
5. **Atomic move** — `rename()` for moving/organizing files.  
6. **Storage view** — Aggregated size/count by category (like disk usage).

---

**Team Mavericks** — Operating Systems Project — File System Management
