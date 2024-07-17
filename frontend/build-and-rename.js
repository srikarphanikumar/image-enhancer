const { execSync } = require('child_process');

// Run the build command
execSync('react-scripts build', { stdio: 'inherit' });

// Run the rename command
execSync('node rename-build.js', { stdio: 'inherit' });
