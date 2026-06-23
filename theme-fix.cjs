const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/bg-surface-container-highest/g, 'bg-slate-100 dark:bg-slate-800');
    content = content.replace(/bg-surface-container-high/g, 'bg-slate-50 dark:bg-slate-800\/80');
    content = content.replace(/bg-surface-container-lowest/g, 'bg-white dark:bg-slate-900\/50');
    content = content.replace(/bg-surface-container-low/g, 'bg-slate-50 dark:bg-slate-900\/80');
    content = content.replace(/bg-surface-container/g, 'bg-white dark:bg-slate-800');
    content = content.replace(/bg-surface-bright/g, 'bg-slate-100 dark:bg-slate-700');
    content = content.replace(/bg-surface\b/g, 'bg-white dark:bg-slate-900');
    
    content = content.replace(/text-on-surface-variant/g, 'text-slate-500 dark:text-slate-400');
    content = content.replace(/text-on-surface\b/g, 'text-slate-800 dark:text-slate-100');
    content = content.replace(/text-on-background/g, 'text-slate-900 dark:text-slate-50');
    content = content.replace(/bg-background\b/g, 'bg-slate-50 dark:bg-slate-950');

    content = content.replace(/border-white\/5/g, 'border-slate-200 dark:border-slate-700\/50');
    content = content.replace(/border-white\/10/g, 'border-slate-200 dark:border-slate-700');
    content = content.replace(/border-white\/20/g, 'border-slate-300 dark:border-slate-600');

    fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory(path.join(__dirname, 'src', 'components'));
replaceInFile(path.join(__dirname, 'src', 'App.tsx'));
console.log('Done!');
