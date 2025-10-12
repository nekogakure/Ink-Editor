const path = require("path");

module.exports = {
  mode: "development",
  entry: "./public/renderer.ts",
  target: "electron-renderer",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.renderer.json",
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "renderer.js",
    path: path.resolve(__dirname, "dist_public"),
  },
  devtool: "source-map",
  externals: {
    "monaco-editor": "monaco",
  },
};
