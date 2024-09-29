import { readdirSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

// Define the folder where your classes are located
const classesFolder = './src/classes';
const indexFilePath = join(classesFolder, 'index.ts');

// Read all the files in the classes folder
const classFiles = readdirSync(classesFolder)
    .filter(file => extname(file) === '.ts' && file !== 'index.ts') // Ignore the index.ts itself
    .map(file => basename(file, '.ts')); // Get the class file names without the extension

// Create the content for index.ts
const indexContent = classFiles
    .map(className => `export * from './${className}';`)
    .join('\n');

// Write the content to index.ts
writeFileSync(indexFilePath, indexContent, { encoding: 'utf8' });

console.log(`Generated index.ts with exports from ${classFiles.length} files.`);