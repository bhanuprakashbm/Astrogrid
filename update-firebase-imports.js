const fs = require('fs');
const path = require('path');

// Directories to search for files with Firebase imports
const directories = [
    path.join(__dirname, 'src', 'pages'),
    path.join(__dirname, 'src', 'components')
];

// Function to update imports in a single file
function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace Firebase imports
        if (content.includes('from \'../../firebase\'') ||
            content.includes('from "../../firebase"')) {
            content = content.replace(
                /import\s+\{([^}]+)\}\s+from\s+(['"])\.\.\/\.\.\/firebase\2/g,
                'import {$1} from \'../../services/api\''
            );
            content = content.replace(
                /import\s+\{?\s*db\s*,?\s*([^}]*)\}?\s+from\s+(['"])\.\.\/\.\.\/firebase\2/g,
                'import {$1} from \'../../services/api\''
            );
            content = content.replace(
                /import\s+\{?\s*db\s*\}?\s+from\s+(['"])\.\.\/\.\.\/firebase\1/g,
                '// Using api service instead of firebase'
            );
            modified = true;
        }

        // Replace Firestore imports
        if (content.includes('from \'firebase/firestore\'') ||
            content.includes('from "firebase/firestore"')) {
            content = content.replace(
                /import\s+\{([^}]+)\}\s+from\s+(['"])firebase\/firestore\2/g,
                'import {$1} from \'../../services/api\''
            );
            modified = true;
        }

        // Replace db references with null (our API service doesn't need db parameter)
        if (content.includes('collection(db,')) {
            content = content.replace(/collection\(db,/g, 'collection(null,');
            modified = true;
        }

        if (content.includes('doc(db,')) {
            content = content.replace(/doc\(db,/g, 'doc(null,');
            modified = true;
        }

        // Save the file if modified
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

// Function to recursively search directories for JS/JSX files
function searchDirectory(directory) {
    const items = fs.readdirSync(directory);

    for (const item of items) {
        const itemPath = path.join(directory, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            searchDirectory(itemPath);
        } else if (stats.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
            updateFile(itemPath);
        }
    }
}

// Process each directory
directories.forEach(directory => {
    console.log(`Processing directory: ${directory}`);
    searchDirectory(directory);
});

console.log('Finished updating Firebase imports to use MySQL API service.'); 