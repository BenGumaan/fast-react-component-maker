const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  externals: {
    // VS Code loads this at runtime , so we don't need to bundle it.
    vscode: 'commonjs vscode' // VS code is not a module, but rather a global object, so we need to use the 'commonjs' keyword to indicate that. 
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'source-map',
  cache: {
    type: 'filesystem', // Use the file system to cache the compilation results. For faster builds.
  },
};
