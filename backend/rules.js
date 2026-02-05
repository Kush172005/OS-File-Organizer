/**
 * FILE CATEGORIZATION RULES
 * Maps file extensions to categories
 */

const path = require('path');

const CATEGORY_RULES = {
    'Documents': ['.pdf', '.doc', '.docx', '.txt'],
    'Images': ['.jpg', '.jpeg', '.png'],
    'Audio': ['.mp3', '.wav'],
    'Videos': ['.mp4', '.mkv'],
};

const DEFAULT_CATEGORY = 'Others';

function getCategoryForFile(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    
    if (!extension) {
        return DEFAULT_CATEGORY;
    }
    
    for (const [category, extensions] of Object.entries(CATEGORY_RULES)) {
        if (extensions.includes(extension)) {
            return category;
        }
    }
    
    return DEFAULT_CATEGORY;
}

function getAllCategories() {
    return [...Object.keys(CATEGORY_RULES), DEFAULT_CATEGORY];
}

module.exports = {
    getCategoryForFile,
    getAllCategories,
    CATEGORY_RULES,
    DEFAULT_CATEGORY
};
