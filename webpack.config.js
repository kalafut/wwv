const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MarkdownPlugin = require('markdown-html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyWebpackPlugin([
      './src/index.html',
      './src/main.css',
      'images/*',
      'clips/*',
    ]),
    new MarkdownPlugin({
      filePath: '../src',
      exportPath: '../dist/',
      // template: 'template.html'
    }),
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'eslint-loader',
          options: {
            fix: true,
          },
        },
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
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
