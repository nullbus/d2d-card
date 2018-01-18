var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var srcDir = path.resolve(__dirname, 'src');
var dataDir = path.resolve(__dirname, 'data');
var distDir = path.resolve(__dirname, 'dist');

module.exports = {
    entry: path.resolve(srcDir, 'index.js'),
    output: {
        path: distDir,
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: distDir
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: srcDir
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            {from: dataDir} // to: output.path
        ]),

        new webpack.NoErrorsPlugin() // avoid publishing file when compilation fails
    ],
    stats: {
        // colored output
        colors: true
    },
    devtool: 'source-map',
}
