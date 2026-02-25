import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Use /tmp on Vercel (read-only filesystem), local path otherwise
const UPLOAD_DIR = process.env.VERCEL
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, 'uploads');
const TRASH_DIR = path.join(UPLOAD_DIR, '.trash');
const TRASH_METADATA_FILE = path.join(TRASH_DIR, 'metadata.json');

app.use(cors());
app.use(express.json());

// Serve uploaded files statically (for preview in browser)
app.use('/uploads', express.static(UPLOAD_DIR));

// File categorization rules
const CATEGORY_RULES = {
    'Documents': ['.pdf', '.doc', '.docx', '.txt', '.md'],
    'Images': ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
    'Audio': ['.mp3', '.wav', '.ogg', '.m4a'],
    'Videos': ['.mp4', '.mkv', '.avi', '.mov', '.webm'],
    'Archives': ['.zip', '.rar', '.7z', '.tar', '.gz'],
    'Code': ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css'],
};

const DEFAULT_CATEGORY = 'Others';

// Resolve path relative to UPLOAD_DIR; prevent directory traversal
function resolveSafePath(relativePath) {
    if (!relativePath || relativePath === '.' || relativePath === '/') {
        return UPLOAD_DIR;
    }
    const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const resolved = path.join(UPLOAD_DIR, normalized);
    if (!resolved.startsWith(UPLOAD_DIR)) {
        return null;
    }
    return resolved;
}

function getCategoryForFile(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    
    if (!extension) return DEFAULT_CATEGORY;
    
    for (const [category, extensions] of Object.entries(CATEGORY_RULES)) {
        if (extensions.includes(extension)) {
            return category;
        }
    }
    
    return DEFAULT_CATEGORY;
}

/**
 * Returns a unique file name in the given directory.
 * If "name.ext" exists, returns "name (1).ext", "name (2).ext", etc.
 * Like Windows/Explorer duplicate handling.
 */
async function getUniqueFileName(dirPath, baseName) {
    const ext = path.extname(baseName);
    const base = path.basename(baseName, ext);
    let candidate = baseName;
    let n = 1;
    try {
        await fs.mkdir(dirPath, { recursive: true });
        const fullPath = path.join(dirPath, candidate);
        await fs.access(fullPath);
        while (true) {
            candidate = `${base} (${n})${ext}`;
            const p = path.join(dirPath, candidate);
            try {
                await fs.access(p);
                n++;
            } catch {
                return candidate;
            }
        }
    } catch {
        return baseName;
    }
}

// Recycle Bin metadata helpers
async function getTrashMetadata() {
    try {
        await fs.mkdir(TRASH_DIR, { recursive: true });
        const data = await fs.readFile(TRASH_METADATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function saveTrashMetadata(metadata) {
    await fs.mkdir(TRASH_DIR, { recursive: true });
    await fs.writeFile(TRASH_METADATA_FILE, JSON.stringify(metadata, null, 2));
}

// Storage for uploaded files (optional ?folder= subpath).
// If a file with the same name already exists, we save as "name (1).ext", "name (2).ext", etc.
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const sub = (req.query.folder || '').trim().replace(/\.\./g, '');
        const dir = sub ? path.join(UPLOAD_DIR, path.normalize(sub)) : UPLOAD_DIR;
        if (sub && !path.join(UPLOAD_DIR, path.normalize(sub)).startsWith(UPLOAD_DIR)) {
            return cb(new Error('Invalid folder'));
        }
        req._uploadDest = dir;
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const dir = req._uploadDest || UPLOAD_DIR;
        getUniqueFileName(dir, file.originalname)
            .then((name) => cb(null, name))
            .catch((err) => cb(err));
    }
});

const upload = multer({ storage });

// Get all files in uploads directory
app.get('/api/files', async (req, res) => {
    try {
        const uploadDir = UPLOAD_DIR;
        
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
            return res.json({ files: [], categories: {} });
        }
        
        const entries = (await fs.readdir(uploadDir, { withFileTypes: true }))
            .filter(entry => !entry.name.startsWith('.'));
        const fileList = [];
        
        async function addFile(filePath, relativePath, category) {
            try {
                const stats = await fs.stat(filePath);
                fileList.push({
                    name: path.basename(filePath),
                    category,
                    path: filePath,
                    relativePath,
                    size: stats.size,
                    modifiedAt: stats.mtime
                });
            } catch (err) {
                console.error(`Error stating ${filePath}:`, err);
            }
        }
        
        // Get files from root directory
        const rootFiles = entries.filter(entry => entry.isFile());
        for (const file of rootFiles) {
            const filePath = path.join(uploadDir, file.name);
            await addFile(filePath, file.name, getCategoryForFile(file.name));
        }
        
        // Get files from subdirectories (categories)
        const directories = entries.filter(entry => entry.isDirectory());
        for (const dir of directories) {
            const categoryPath = path.join(uploadDir, dir.name);
            try {
                const categoryFiles = await fs.readdir(categoryPath, { withFileTypes: true });
                for (const file of categoryFiles.filter(entry => entry.isFile())) {
                    const filePath = path.join(categoryPath, file.name);
                    await addFile(filePath, `${dir.name}/${file.name}`, dir.name);
                }
            } catch (err) {
                console.error(`Error reading directory ${dir.name}:`, err);
            }
        }
        
        // Group by category
        const categories = {};
        fileList.forEach(file => {
            if (!categories[file.category]) {
                categories[file.category] = [];
            }
            categories[file.category].push(file);
        });
        
        res.json({ files: fileList, categories });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload files (optional query: ?folder=Documents to upload into a folder)
app.post('/api/upload', upload.array('files'), async (req, res) => {
    try {
        const folder = (req.query.folder || '').trim();
        const files = (req.files || []).map(file => {
            const rel = folder ? `${folder}/${file.filename}` : file.filename;
            return {
                name: file.filename,
                category: getCategoryForFile(file.filename),
                path: file.path,
                relativePath: rel
            };
        });
        res.json({ success: true, files });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Organize files: move root-level files into category folders.
// If a file with the same name already exists in the category, use unique name (e.g. "file (1).pdf").
// Organize can be run multiple times; new uploads in root will be organized each time.
app.post('/api/organize', async (req, res) => {
    try {
        const uploadDir = UPLOAD_DIR;
        const entries = await fs.readdir(uploadDir, { withFileTypes: true });
        const files = entries.filter(entry => entry.isFile());
        
        const operations = [];
        
        for (const file of files) {
            const fileName = file.name;
            const sourcePath = path.join(uploadDir, fileName);
            const category = getCategoryForFile(fileName);
            const categoryPath = path.join(uploadDir, category);
            
            await fs.mkdir(categoryPath, { recursive: true });
            
            const destFileName = await getUniqueFileName(categoryPath, fileName);
            const destPath = path.join(categoryPath, destFileName);
            
            await fs.rename(sourcePath, destPath);
            operations.push({
                file: fileName,
                category,
                status: 'moved',
                destName: destFileName,
                from: sourcePath,
                to: destPath
            });
        }
        
        res.json({ success: true, operations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Move file to specific category (optional sourcePath = relative path to file for exact location)
app.post('/api/move', async (req, res) => {
    try {
        const { fileName, targetCategory, sourcePath: sourceRel } = req.body || {};
        const uploadDir = UPLOAD_DIR;
        let sourcePath = null;

        if (sourceRel && typeof sourceRel === 'string') {
            const resolved = resolveSafePath(sourceRel.trim());
            if (resolved && path.basename(resolved) === fileName) {
                try {
                    const stat = await fs.stat(resolved);
                    if (stat.isFile()) sourcePath = resolved;
                } catch (_) {}
            }
        }
        if (!sourcePath) {
            try {
                const rootPath = path.join(uploadDir, fileName);
                await fs.access(rootPath);
                sourcePath = rootPath;
            } catch {
                const entries = await fs.readdir(uploadDir, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        const categoryPath = path.join(uploadDir, entry.name);
                        try {
                            const categoryFiles = await fs.readdir(categoryPath);
                            if (categoryFiles.includes(fileName)) {
                                sourcePath = path.join(categoryPath, fileName);
                                break;
                            }
                        } catch (err) {
                            continue;
                        }
                    }
                }
            }
        }
        if (!sourcePath) {
            return res.status(404).json({ error: 'File not found' });
        }
        const targetPath = path.join(uploadDir, targetCategory);
        await fs.mkdir(targetPath, { recursive: true });
        const destPath = path.join(targetPath, fileName);
        try {
            await fs.access(destPath);
            return res.status(400).json({ error: 'File already exists in target category' });
        } catch {
            // OK
        }
        await fs.rename(sourcePath, destPath);
        res.json({ success: true, message: `Moved ${fileName} to ${targetCategory}` });
    } catch (error) {
        console.error('Move error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete file (optional path query for exact location)
app.delete('/api/files/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        const pathParam = (req.query.path || '').trim();
        const uploadDir = UPLOAD_DIR;
        let filePath = null;

        if (pathParam) {
            const resolved = resolveSafePath(pathParam);
            if (resolved && path.basename(resolved) === fileName) {
                try {
                    const stat = await fs.stat(resolved);
                    if (stat.isFile()) filePath = resolved;
                } catch (_) {}
            }
        }
        if (!filePath) {
            try {
                const rootPath = path.join(uploadDir, fileName);
                await fs.access(rootPath);
                filePath = rootPath;
            } catch {
                const entries = await fs.readdir(uploadDir, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        const categoryPath = path.join(uploadDir, entry.name);
                        try {
                            const categoryFiles = await fs.readdir(categoryPath);
                            if (categoryFiles.includes(fileName)) {
                                filePath = path.join(categoryPath, fileName);
                                break;
                            }
                        } catch (err) {
                            continue;
                        }
                    }
                }
            }
        }
        if (!filePath) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Move to Trash instead of unlinking
        await fs.mkdir(TRASH_DIR, { recursive: true });
        const trashName = `${Date.now()}-${fileName}`;
        const trashPath = path.join(TRASH_DIR, trashName);
        
        const metadata = await getTrashMetadata();
        metadata[trashName] = {
            originalName: fileName,
            originalPath: path.relative(UPLOAD_DIR, filePath),
            category: getCategoryForFile(fileName),
            deletedAt: new Date().toISOString(),
            size: (await fs.stat(filePath)).size
        };
        
        await fs.rename(filePath, trashPath);
        await saveTrashMetadata(metadata);
        
        res.json({ success: true, message: `Moved ${fileName} to Recycle Bin` });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get file details (metadata)
app.get('/api/files/:fileName/details', async (req, res) => {
    try {
        const { fileName } = req.params;
        const uploadDir = UPLOAD_DIR;
        
        let filePath = null;
        let fileCategory = null;
        
        // Search in root directory first
        try {
            const rootPath = path.join(uploadDir, fileName);
            await fs.access(rootPath);
            filePath = rootPath;
            fileCategory = getCategoryForFile(fileName);
        } catch {
            // Not in root, search in subdirectories
            const entries = await fs.readdir(uploadDir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const categoryPath = path.join(uploadDir, entry.name);
                    try {
                        const categoryFiles = await fs.readdir(categoryPath);
                        if (categoryFiles.includes(fileName)) {
                            filePath = path.join(categoryPath, fileName);
                            fileCategory = entry.name;
                            break;
                        }
                    } catch (err) {
                        continue;
                    }
                }
            }
        }
        
        if (!filePath) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const stats = await fs.stat(filePath);
        const extension = path.extname(fileName).toLowerCase();
        
        res.json({
            name: fileName,
            category: fileCategory,
            extension: extension,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
        });
    } catch (error) {
        console.error('File details error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get storage usage per category
app.get('/api/storage', async (req, res) => {
    try {
        const uploadDir = UPLOAD_DIR;
        const result = {
            totalSize: 0,
            categories: {}
        };

        try {
            await fs.access(uploadDir);
        } catch {
            return res.json(result);
        }

        const entries = (await fs.readdir(uploadDir, { withFileTypes: true }))
            .filter(entry => !entry.name.startsWith('.'));

        // Process root-level files
        for (const entry of entries) {
            if (entry.isFile()) {
                const filePath = path.join(uploadDir, entry.name);
                const stats = await fs.stat(filePath);
                const category = getCategoryForFile(entry.name);

                if (!result.categories[category]) {
                    result.categories[category] = { size: 0, fileCount: 0 };
                }
                result.categories[category].size += stats.size;
                result.categories[category].fileCount += 1;
                result.totalSize += stats.size;
            }
        }

        // Process subdirectory files
        const directories = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));
        for (const dir of directories) {
            const dirPath = path.join(uploadDir, dir.name);
            try {
                const dirFiles = await fs.readdir(dirPath, { withFileTypes: true });
                for (const file of dirFiles) {
                    if (file.isFile()) {
                        const filePath = path.join(dirPath, file.name);
                        const stats = await fs.stat(filePath);
                        const category = dir.name;

                        if (!result.categories[category]) {
                            result.categories[category] = { size: 0, fileCount: 0 };
                        }
                        result.categories[category].size += stats.size;
                        result.categories[category].fileCount += 1;
                        result.totalSize += stats.size;
                    }
                }
            } catch (err) {
                console.error(`Error reading directory ${dir.name}:`, err);
            }
        }

        res.json(result);
    } catch (error) {
        console.error('Error calculating storage:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get categories
app.get('/api/categories', (req, res) => {
    res.json({ categories: Object.keys(CATEGORY_RULES).concat([DEFAULT_CATEGORY]) });
});

// Download file with Content-Disposition: attachment (OS: read stream, client saves to disk)
app.get('/api/download', async (req, res) => {
    try {
        const relativePath = (req.query.path || '').trim();
        const filePath = resolveSafePath(relativePath);
        if (!filePath || filePath === UPLOAD_DIR) {
            return res.status(400).json({ error: 'Invalid or missing path' });
        }
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) {
            return res.status(400).json({ error: 'Not a file' });
        }
        const fileName = path.basename(filePath);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        const stream = createReadStream(filePath);
        stream.on('error', (err) => {
            if (!res.headersSent) res.status(500).json({ error: err.message });
        });
        stream.pipe(res);
    } catch (error) {
        if (error.code === 'ENOENT') return res.status(404).json({ error: 'File not found' });
        console.error('Download error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Recursively get folder total size, file count, and latest modified time
async function getFolderStats(dirPath) {
    let totalSize = 0;
    let fileCount = 0;
    let modifiedAt = null;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const e of entries) {
        const fullPath = path.join(dirPath, e.name);
        try {
            if (e.isDirectory()) {
                const sub = await getFolderStats(fullPath);
                totalSize += sub.totalSize;
                fileCount += sub.fileCount;
                if (sub.modifiedAt && (!modifiedAt || sub.modifiedAt > modifiedAt)) modifiedAt = sub.modifiedAt;
            } else {
                const st = await fs.stat(fullPath);
                totalSize += st.size;
                fileCount += 1;
                if (!modifiedAt || st.mtime > modifiedAt) modifiedAt = st.mtime;
            }
        } catch (err) {
            // skip inaccessible entries
        }
    }
    return { totalSize, fileCount, modifiedAt };
}

// Browse directory by path (OS: directory listing / readdir)
app.get('/api/browse', async (req, res) => {
    try {
        const relativePath = (req.query.path || '').trim();
        const dirPath = resolveSafePath(relativePath);
        if (!dirPath) {
            return res.status(400).json({ error: 'Invalid path' });
        }
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        try {
            await fs.access(dirPath);
        } catch {
            return res.json({ path: relativePath, folders: [], files: [] });
        }
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
            return res.status(400).json({ error: 'Not a directory' });
        }
        const entries = (await fs.readdir(dirPath, { withFileTypes: true }))
            .filter(entry => !entry.name.startsWith('.'));
        const folders = [];
        const files = [];
        for (const e of entries) {
            const fullPath = path.join(dirPath, e.name);
            const rel = relativePath ? `${relativePath}/${e.name}` : e.name;
            if (e.isDirectory()) {
                const stats = await getFolderStats(fullPath);
                folders.push({
                    name: e.name,
                    relativePath: rel,
                    totalSize: stats.totalSize,
                    fileCount: stats.fileCount,
                    modifiedAt: stats.modifiedAt,
                });
            } else {
                const st = await fs.stat(fullPath);
                files.push({
                    name: e.name,
                    relativePath: rel,
                    category: getCategoryForFile(e.name),
                    size: st.size,
                    modifiedAt: st.mtime,
                });
            }
        }
        folders.sort((a, b) => a.name.localeCompare(b.name));
        files.sort((a, b) => a.name.localeCompare(b.name));
        res.json({ path: relativePath, folders, files });
    } catch (error) {
        console.error('Browse error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create folder (OS: mkdir)
app.post('/api/folders', async (req, res) => {
    try {
        const { path: relativePath } = req.body || {};
        const dirPath = resolveSafePath(relativePath || '');
        if (!dirPath || dirPath === UPLOAD_DIR) {
            return res.status(400).json({ error: 'Invalid or missing folder path' });
        }
        await fs.mkdir(dirPath, { recursive: true });
        const name = path.basename(dirPath);
        res.json({ success: true, name, path: relativePath || name });
    } catch (error) {
        console.error('Create folder error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete folder (OS: rmdir - must be empty)
app.delete('/api/folders', async (req, res) => {
    try {
        const pathParam = (req.query.path || req.body?.path || '').trim();
        const dirPath = resolveSafePath(pathParam);
        if (!dirPath || dirPath === UPLOAD_DIR) {
            return res.status(400).json({ error: 'Invalid or missing folder path' });
        }
        const entries = await fs.readdir(dirPath);
        if (entries.length > 0) {
            return res.status(400).json({ error: 'Folder is not empty. Delete or move contents first.' });
        }
        await fs.rmdir(dirPath);
        res.json({ success: true, message: 'Folder deleted' });
    } catch (error) {
        if (error.code === 'ENOENT') return res.status(404).json({ error: 'Folder not found' });
        console.error('Delete folder error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rename file or folder (OS: rename)
app.put('/api/rename', async (req, res) => {
    try {
        const { relativePath, newName } = req.body || {};
        if (!relativePath || !newName || !newName.trim()) {
            return res.status(400).json({ error: 'relativePath and newName required' });
        }
        const safePath = resolveSafePath(relativePath);
        if (!safePath || safePath === UPLOAD_DIR) {
            return res.status(400).json({ error: 'Invalid path' });
        }
        try {
            await fs.access(safePath);
        } catch {
            return res.status(404).json({ error: 'File or folder not found' });
        }
        const dir = path.dirname(safePath);
        const newPath = path.join(dir, newName.trim());
        if (path.relative(UPLOAD_DIR, newPath).startsWith('..')) {
            return res.status(400).json({ error: 'Invalid new path' });
        }
        await fs.rename(safePath, newPath);
        const newRel = path.dirname(relativePath) ? `${path.dirname(relativePath)}/${newName.trim()}` : newName.trim();
        res.json({ success: true, relativePath: newRel });
    } catch (error) {
        console.error('Rename error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Copy file (OS: read + write copy)
app.post('/api/copy', async (req, res) => {
    try {
        const { relativePath, targetPath } = req.body || {};
        if (!relativePath || !targetPath) {
            return res.status(400).json({ error: 'relativePath and targetPath required' });
        }
        const sourcePath = resolveSafePath(relativePath);
        const destDir = resolveSafePath(targetPath);
        if (!sourcePath || !destDir) {
            return res.status(400).json({ error: 'Invalid path' });
        }
        const stat = await fs.stat(sourcePath);
        if (stat.isDirectory()) {
            return res.status(400).json({ error: 'Copying folders not supported' });
        }
        await fs.mkdir(destDir, { recursive: true });
        const fileName = path.basename(sourcePath);
        const destPath = path.join(destDir, fileName);
        await fs.copyFile(sourcePath, destPath);
        const newRel = targetPath ? `${targetPath}/${fileName}` : fileName;
        res.json({ success: true, relativePath: newRel });
    } catch (error) {
        console.error('Copy error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Search files by name (OS: directory traversal + string match)
app.get('/api/search', async (req, res) => {
    try {
        const q = (req.query.q || '').trim().toLowerCase();
        if (!q) {
            return res.json({ results: [] });
        }
        const results = [];
        async function scan(dir, relPrefix) {
            const entries = (await fs.readdir(dir, { withFileTypes: true }))
                .filter(entry => !entry.name.startsWith('.'));
            for (const e of entries) {
                const rel = relPrefix ? `${relPrefix}/${e.name}` : e.name;
                if (e.name.toLowerCase().includes(q)) {
                    if (e.isFile()) {
                        const fullPath = path.join(dir, e.name);
                        const st = await fs.stat(fullPath);
                        results.push({
                            name: e.name,
                            relativePath: rel,
                            category: getCategoryForFile(e.name),
                            size: st.size,
                            modifiedAt: st.mtime,
                        });
                    } else {
                        results.push({ name: e.name, relativePath: rel, isFolder: true });
                    }
                }
                if (e.isDirectory()) {
                    await scan(path.join(dir, e.name), rel);
                }
            }
        }
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        await scan(UPLOAD_DIR, '');
        res.json({ results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Recycle Bin Endpoints ---

// Get all files in Recycle Bin
app.get('/api/trash', async (req, res) => {
    try {
        const metadata = await getTrashMetadata();
        const trashFiles = Object.entries(metadata).map(([trashName, info]) => ({
            trashName,
            ...info,
            relativePath: `.trash/${trashName}`
        }));
        res.json({ trash: trashFiles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Restore file from Recycle Bin
app.post('/api/trash/restore', async (req, res) => {
    try {
        const { trashName } = req.body;
        if (!trashName) return res.status(400).json({ error: 'trashName required' });

        const metadata = await getTrashMetadata();
        const fileInfo = metadata[trashName];

        if (!fileInfo) return res.status(404).json({ error: 'File not found in trash' });

        const sourcePath = path.join(TRASH_DIR, trashName);
        const destPath = path.join(UPLOAD_DIR, fileInfo.originalPath);

        // Ensure destination directory exists
        await fs.mkdir(path.dirname(destPath), { recursive: true });

        // If file already exists at destination, rename it
        let finalDestPath = destPath;
        try {
            await fs.access(destPath);
            const ext = path.extname(fileInfo.originalName);
            const base = path.basename(fileInfo.originalName, ext);
            finalDestPath = path.join(path.dirname(destPath), `${base}-restored-${Date.now()}${ext}`);
        } catch {
            // OK
        }

        await fs.rename(sourcePath, finalDestPath);
        delete metadata[trashName];
        await saveTrashMetadata(metadata);

        res.json({ success: true, message: `Restored to ${path.relative(UPLOAD_DIR, finalDestPath)}` });
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Permanently delete file from Recycle Bin
app.delete('/api/trash/:trashName', async (req, res) => {
    try {
        const { trashName } = req.params;
        const metadata = await getTrashMetadata();
        const fileInfo = metadata[trashName];

        if (!fileInfo) return res.status(404).json({ error: 'File not found in trash' });

        const filePath = path.join(TRASH_DIR, trashName);
        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.error('Error unlinking file in trash:', err);
        }

        delete metadata[trashName];
        await saveTrashMetadata(metadata);

        res.json({ success: true, message: 'Permanently deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Empty Recycle Bin
app.delete('/api/trash-empty', async (req, res) => {
    try {
        const metadata = await getTrashMetadata();
        for (const trashName of Object.keys(metadata)) {
            try {
                await fs.unlink(path.join(TRASH_DIR, trashName));
            } catch (err) {
                // Ignore errors (file might be missing)
            }
        }
        await saveTrashMetadata({});
        res.json({ success: true, message: 'Recycle Bin emptied' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
