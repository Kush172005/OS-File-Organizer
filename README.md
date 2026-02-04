# File Organizer - Operating Systems Project

A CLI-based file organization tool built with Node.js that demonstrates **File System Management** concepts in Operating Systems.

---

## 📚 What is File System Management?

**File System Management** is a core component of Operating Systems that handles how data is stored, organized, and retrieved on storage devices. It provides an abstraction layer between the physical storage hardware and the applications that use it.

### Key Responsibilities:

1. **File Organization**: Structuring files in directories/folders
2. **File Operations**: Create, read, update, delete (CRUD) operations
3. **Path Resolution**: Converting relative/absolute paths to physical locations
4. **Access Control**: Managing permissions and file ownership
5. **Metadata Management**: Storing file attributes (size, type, timestamps)
6. **Space Management**: Allocating and deallocating storage space

---

## 🎯 How This Project Relates to OS Concepts

This File Organizer demonstrates several fundamental OS concepts:

### 1. **File System Operations**
- **Reading directories**: Uses `readdir()` to scan directory contents
- **Moving files**: Uses `rename()` for atomic file movement
- **Creating directories**: Uses `mkdir()` with recursive flag
- **File metadata**: Extracts file extensions and types

### 2. **System Calls**
Node.js `fs` module maps directly to OS system calls:

| Node.js Function | OS System Call | Purpose |
|-----------------|----------------|---------|
| `fs.readdir()` | `readdir()` | Read directory entries |
| `fs.rename()` | `rename()` | Move/rename files |
| `fs.mkdir()` | `mkdir()` | Create directories |
| `fs.access()` | `access()` | Check file existence/permissions |
| `fs.appendFile()` | `open()` + `write()` | Append to log file |

### 3. **Path Resolution**
- Converts relative paths to absolute paths
- Handles cross-platform path separators
- Resolves parent directory references

### 4. **Error Handling**
- Permission denied errors (EACCES)
- File not found errors (ENOENT)
- File in use errors (EBUSY)
- Invalid path errors

### 5. **I/O Operations**
- Asynchronous I/O using `async/await`
- Non-blocking file operations
- Buffered logging to disk

### 6. **File Classification**
- Uses file extensions as metadata
- Implements categorization logic
- Demonstrates file type identification

---

## 🏗️ Project Structure

```
file-organizer/
├── organizer.js        # Main CLI entry point
├── rules.js            # File extension to category mapping
├── utils.js            # Helper functions (logging, directory management)
├── logs.txt            # Operation logs (auto-generated)
└── README.md           # This file
```

---

## 🚀 How to Run

### Prerequisites
- Node.js installed (v12 or higher)
- Terminal/Command Prompt access

### Steps

1. **Navigate to the project directory**:
   ```bash
   cd file-organizer
   ```

2. **Create a test directory** (sandbox):
   ```bash
   mkdir sandbox
   ```

3. **Add some test files** to the sandbox:
   ```bash
   cd sandbox
   touch resume.pdf photo.jpg song.mp3 video.mp4 notes.txt document.docx
   cd ..
   ```

4. **Run the organizer**:
   ```bash
   node organizer.js ./sandbox
   ```

### Expected Output

```
----------------------------------
FILE ORGANIZER STARTED
----------------------------------
Target Directory: /absolute/path/to/sandbox

Found 6 file(s)

[MOVED] resume.pdf → Documents/
[MOVED] photo.jpg → Images/
[MOVED] song.mp3 → Audio/
[MOVED] video.mp4 → Videos/
[MOVED] notes.txt → Documents/
[MOVED] document.docx → Documents/

----------------------------------
ORGANIZATION COMPLETED
----------------------------------

Summary:
  Total files found: 6
  Successfully moved: 6
  Skipped/Errors: 0
```

### After Running

Check the `sandbox` directory - files will be organized into category folders:

```
sandbox/
├── Documents/
│   ├── resume.pdf
│   ├── notes.txt
│   └── document.docx
├── Images/
│   └── photo.jpg
├── Audio/
│   └── song.mp3
└── Videos/
    └── video.mp4
```

---

## 📋 File Categorization Rules

| Category | Extensions |
|----------|-----------|
| **Documents** | `.pdf`, `.doc`, `.docx`, `.txt` |
| **Images** | `.jpg`, `.jpeg`, `.png` |
| **Audio** | `.mp3`, `.wav` |
| **Videos** | `.mp4`, `.mkv` |
| **Others** | Everything else |

---

## 📝 Logging

All operations are logged to `logs.txt` with timestamps:

```
[2026-02-04T01:37:39.123Z] MOVED | File: resume.pdf | Category: Documents
[2026-02-04T01:37:39.456Z] MOVED | File: photo.jpg | Category: Images
[2026-02-04T01:37:39.789Z] ERROR | File: locked.txt | Category: N/A | Details: EACCES: permission denied
```

---

## 🔒 Safety Features

1. **Non-destructive**: Only operates on the specified directory
2. **Duplicate handling**: Skips files that already exist at destination
3. **Error recovery**: Continues processing even if individual files fail
4. **Validation**: Checks directory existence before processing
5. **Atomic operations**: Uses `rename()` for safe file movement

---

## 🧪 Testing Scenarios

### Test 1: Basic Organization
```bash
mkdir test1
cd test1
touch file1.pdf file2.jpg file3.mp3
cd ..
node organizer.js ./test1
```

### Test 2: Mixed Files
```bash
mkdir test2
cd test2
touch report.pdf image.png song.wav video.mkv unknown.xyz
cd ..
node organizer.js ./test2
```

### Test 3: Error Handling (Permission Denied)
```bash
mkdir test3
cd test3
touch locked.txt
chmod 000 locked.txt  # Remove all permissions
cd ..
node organizer.js ./test3
```

### Test 4: Empty Directory
```bash
mkdir test4
node organizer.js ./test4
```

---

## 🎓 OS Concepts Summary

### What You Learn:
1. **File System Hierarchy**: How files are organized in directories
2. **System Calls**: How applications interact with the OS kernel
3. **Path Resolution**: How OS resolves file paths
4. **Error Handling**: How OS reports and handles file system errors
5. **Atomic Operations**: How OS ensures file operation integrity
6. **Metadata**: How OS stores and uses file information

### Real-World Applications:
- Download folder organizers
- Photo management tools
- Document archiving systems
- Backup utilities
- Media library organizers

---

## 🔧 Technical Details

### Node.js Built-in Modules Used:
- **`fs`**: File system operations
- **`path`**: Path manipulation and resolution

### Async/Await Pattern:
Uses modern JavaScript async/await for clean, readable asynchronous code instead of callbacks.

### Error Handling Strategy:
- Try-catch blocks for each file operation
- Graceful degradation (continues on errors)
- Detailed error logging
- User-friendly error messages

---

## 📖 For Viva/Demo

### Key Points to Explain:

1. **File System Abstraction**: How the OS provides a logical view of physical storage
2. **System Call Mapping**: How Node.js `fs` functions map to OS system calls
3. **Atomic Operations**: Why `rename()` is preferred over copy+delete
4. **Error Codes**: What EACCES, ENOENT, EBUSY mean
5. **Path Resolution**: Difference between relative and absolute paths
6. **Directory Structure**: How hierarchical file systems work

### Demo Flow:
1. Show the code structure and explain each module
2. Create test files with different extensions
3. Run the organizer and show real-time output
4. Show the organized directory structure
5. Show the log file with timestamps
6. Demonstrate error handling (locked file, invalid path)

---

## 📚 References

- [Node.js File System Documentation](https://nodejs.org/api/fs.html)
- [POSIX File System Calls](https://pubs.opengroup.org/onlinepubs/9699919799/)
- Operating Systems Concepts by Silberschatz, Galvin, and Gagne

---

## 👨‍💻 Author

Created for Operating Systems course demonstration.

**License**: MIT (Educational Use)
