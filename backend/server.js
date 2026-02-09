import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Storage for uploaded files
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});



const upload = multer({ storage });

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get all files in uploads directory
app.get('/api/files', async (req, res) => {
    try {
        const uploadDir = path.join(__dirname, 'uploads');
        
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
            return res.json({ files: [], categories: {} });
        }
        
        const entries = await fs.readdir(uploadDir, { withFileTypes: true });
        const fileList = [];
        
        // Get files from root directory
        const rootFiles = entries.filter(entry => entry.isFile());
        for (const file of rootFiles) {
            const filePath = path.join(uploadDir, file.name);
            const stats = await fs.stat(filePath);
            
            fileList.push({
                name: file.name,
                category: getCategoryForFile(file.name),
                path: filePath,
                size: formatFileSize(stats.size),
                sizeBytes: stats.size,
                createdAt: stats.birthtime,
                url: `/uploads/${file.name}`
            });
        }
        
        // Get files from subdirectories (categories)
        const directories = entries.filter(entry => entry.isDirectory());
        for (const dir of directories) {
            const categoryPath = path.join(uploadDir, dir.name);
            try {
                const categoryFiles = await fs.readdir(categoryPath, { withFileTypes: true });
                const files = categoryFiles.filter(entry => entry.isFile());
                
                for (const file of files) {
                    const filePath = path.join(categoryPath, file.name);
                    const stats = await fs.stat(filePath);
                    
                    fileList.push({
                        name: file.name,
                        category: dir.name,
                        path: filePath,
                        size: formatFileSize(stats.size),
                        sizeBytes: stats.size,
                        createdAt: stats.birthtime,
                        url: `/uploads/${dir.name}/${file.name}`
                    });
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

// Upload files
app.post('/api/upload', upload.array('files'), async (req, res) => {
    try {
        const files = req.files.map(file => ({
            name: file.filename,
            category: getCategoryForFile(file.filename),
            path: file.path,
            url: `/uploads/${file.filename}`
        }));

        
        res.json({ success: true, files });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Organize files
app.post('/api/organize', async (req, res) => {
    try {
        const uploadDir = path.join(__dirname, 'uploads');
        const entries = await fs.readdir(uploadDir, { withFileTypes: true });
        const files = entries.filter(entry => entry.isFile());
        
        const operations = [];
        
        for (const file of files) {
            const fileName = file.name;
            const sourcePath = path.join(uploadDir, fileName);
            const category = getCategoryForFile(fileName);
            const categoryPath = path.join(uploadDir, category);
            
            await fs.mkdir(categoryPath, { recursive: true });
            
            const destPath = path.join(categoryPath, fileName);
            
            try {
                await fs.access(destPath);
                operations.push({
                    file: fileName,
                    category,
                    status: 'skipped',
                    reason: 'already exists'
                });
            } catch {
                await fs.rename(sourcePath, destPath);
                operations.push({
                    file: fileName,
                    category,
                    status: 'moved',
                    from: sourcePath,
                    to: destPath
                });
            }
        }
        
        res.json({ success: true, operations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Move file to specific category
app.post('/api/move', async (req, res) => {
    try {
        const { fileName, targetCategory } = req.body;
        const uploadDir = path.join(__dirname, 'uploads');
        
        let sourcePath = null;
        
        // Search in root directory first
        try {
            const rootPath = path.join(uploadDir, fileName);
            await fs.access(rootPath);
            sourcePath = rootPath;
        } catch {
            // Not in root, search in subdirectories
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
        
        if (!sourcePath) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const targetPath = path.join(uploadDir, targetCategory);
        await fs.mkdir(targetPath, { recursive: true });
        
        const destPath = path.join(targetPath, fileName);
        
        // Check if file already exists at destination
        try {
            await fs.access(destPath);
            return res.status(400).json({ error: 'File already exists in target category' });
        } catch {
            // File doesn't exist, proceed with move
        }
        
        await fs.rename(sourcePath, destPath);
        res.json({ success: true, message: `Moved ${fileName} to ${targetCategory}` });
    } catch (error) {
        console.error('Move error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete file
app.delete('/api/files/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        const uploadDir = path.join(__dirname, 'uploads');
        
        let filePath = null;
        
        // Search in root directory first
        try {
            const rootPath = path.join(uploadDir, fileName);
            await fs.access(rootPath);
            filePath = rootPath;
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
        
        await fs.unlink(filePath);
        res.json({ success: true, message: `Deleted ${fileName}` });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get categories
app.get('/api/categories', (req, res) => {
    res.json({ categories: Object.keys(CATEGORY_RULES).concat([DEFAULT_CATEGORY]) });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
