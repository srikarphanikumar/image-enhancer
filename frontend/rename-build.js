const fs = require('fs');
const path = require('path');

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
