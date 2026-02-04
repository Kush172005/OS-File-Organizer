/**
 * FILE ORGANIZER
 * A CLI tool that automatically organizes files by type
 * Demonstrates OS file system operations
 */

const fs = require('fs').promises;
const path = require('path');
const { getCategoryForFile } = require('./rules');
const { logOperation, printSummary, ensureDirectoryExists } = require('./utils');

async function organizeFiles(targetDir) {
    console.log('----------------------------------');
    console.log('FILE ORGANIZER STARTED');
    console.log('----------------------------------');
    
    try {
        const absolutePath = path.resolve(targetDir);
        console.log(`Target Directory: ${absolutePath}\n`);
        
        // Validate directory exists
        try {
            await fs.access(absolutePath);
        } catch (error) {
            throw new Error(`Directory does not exist: ${absolutePath}`);
        }
        
        const entries = await fs.readdir(absolutePath, { withFileTypes: true });
        const files = entries.filter(entry => entry.isFile());
        
        if (files.length === 0) {
            console.log('No files found to organize.\n');
            console.log('----------------------------------');
            console.log('ORGANIZATION COMPLETED');
            console.log('----------------------------------');
            return;
        }
        
        console.log(`Found ${files.length} file(s)\n`);
        
        let movedCount = 0;
        let errorCount = 0;
        
        for (const file of files) {
            const fileName = file.name;
            const sourcePath = path.join(absolutePath, fileName);
            
            try {
                const category = getCategoryForFile(fileName);
                const categoryPath = path.join(absolutePath, category);
                await ensureDirectoryExists(categoryPath);
                
                const destPath = path.join(categoryPath, fileName);
                
                // Skip if file already exists at destination
                try {
                    await fs.access(destPath);
                    console.log(`[SKIPPED] ${fileName} → ${category}/ (already exists)`);
                    await logOperation('SKIPPED', fileName, category, 'File already exists at destination');
                    continue;
                } catch {
                    // File doesn't exist, proceed with move
                }
                
                // Move file using atomic rename operation
                await fs.rename(sourcePath, destPath);
                
                console.log(`[MOVED] ${fileName} → ${category}/`);
                await logOperation('MOVED', fileName, category);
                movedCount++;
                
            } catch (error) {
                console.error(`[ERROR] ${fileName} → ${error.message}`);
                await logOperation('ERROR', fileName, 'N/A', error.message);
                errorCount++;
            }
        }
        
        console.log('\n----------------------------------');
        console.log('ORGANIZATION COMPLETED');
        console.log('----------------------------------');
        
        printSummary(files.length, movedCount, errorCount);
        
    } catch (error) {
        console.error(`\n[FATAL ERROR] ${error.message}`);
        await logOperation('FATAL_ERROR', 'N/A', 'N/A', error.message);
        process.exit(1);
    }
}

// CLI entry point
if (process.argv.length < 3) {
    console.error('Usage: node organizer.js <directory-path>');
    console.error('Example: node organizer.js ./sandbox');
    process.exit(1);
}

const targetDirectory = process.argv[2];
organizeFiles(targetDirectory);
