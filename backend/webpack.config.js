const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/app.js',
    target: 'node',
    externals: [nodeExternals()],
    mode: 'production', // Add this line
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
};
