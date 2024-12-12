import { copyFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

async function copyStyles() {
    const sourceFile = 'src/styles.css';
    const targetFile = 'dist/styles.css';

    try {
        // Ensure the dist directory exists
        await mkdir(dirname(targetFile), { recursive: true });
        
        // Copy the styles.css file
        await copyFile(sourceFile, targetFile);
        console.log('Successfully copied styles.css to dist folder');
    } catch (error) {
        console.error('Error copying styles.css:', error);
        process.exit(1);
    }
}

copyStyles();
