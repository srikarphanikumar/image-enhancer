// frontend/build-and-rename.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the build command
execSync('npm run build', { stdio: 'inherit' });

// Rename the build directory to dist
const buildPath = path.join(__dirname, 'build');
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(buildPath)) {
    fs.renameSync(buildPath, distPath);
    console.log('Build directory renamed to dist');
} else {
    console.error('Build directory does not exist');
    process.exit(1);
}
