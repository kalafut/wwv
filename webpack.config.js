const path = require("path");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new WebpackShellPluginNext({
      onBuildEnd: ["./finalize.sh"],
    }),
    new ESLintPlugin({
      fix: true, // Automatically fix linting errors if possible
      extensions: ["js", "mjs"], // Specify file extensions
      exclude: ["node_modules", "bower_components"], // Exclude directories
    }),
  ],

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
