/**
 * UTILITY FUNCTIONS
 * Helper functions for directory management and logging
 */

const fs = require('fs').promises;
const path = require('path');

const LOG_FILE = path.join(__dirname, 'logs.txt');

async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        // Create directory with recursive flag to handle nested paths
        await fs.mkdir(dirPath, { recursive: true });
    }
}

async function logOperation(operation, fileName, category, details = '') {
    const timestamp = new Date().toISOString();
    const detailsStr = details ? ` | Details: ${details}` : '';
    const logEntry = `[${timestamp}] ${operation} | File: ${fileName} | Category: ${category}${detailsStr}\n`;
    
    try {
        await fs.appendFile(LOG_FILE, logEntry, 'utf8');
    } catch (error) {
        console.error(`Failed to write to log file: ${error.message}`);
    }
}

function printSummary(totalFiles, movedCount, errorCount) {
    console.log('\nSummary:');
    console.log(`  Total files found: ${totalFiles}`);
    console.log(`  Successfully moved: ${movedCount}`);
    console.log(`  Skipped/Errors: ${totalFiles - movedCount}`);
    
    if (errorCount > 0) {
        console.log(`\n⚠️  ${errorCount} file(s) encountered errors. Check logs.txt for details.`);
    }
}

function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

module.exports = {
    ensureDirectoryExists,
    logOperation,
    printSummary,
    formatFileSize
};
