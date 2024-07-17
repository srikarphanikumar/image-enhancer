const fs = require('fs');
const path = require('path');

// Paths
const buildPath = path.join(__dirname, 'build');
const distPath = path.join(__dirname, 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
}

// Move all contents from build to dist
fs.readdirSync(buildPath).forEach(file => {
    const sourcePath = path.join(buildPath, file);
    const destPath = path.join(distPath, file);
    fs.renameSync(sourcePath, destPath);
});

// Remove the build directory
fs.rmdirSync(buildPath);

console.log('Build directory contents moved to dist');
