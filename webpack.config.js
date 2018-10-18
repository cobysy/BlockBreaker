const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: path.join(__dirname, '/src/index.ts'),
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist/js'),
        publicPath: '/js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devServer: {
        contentBase: './dist',
        port: 5000
    }
};