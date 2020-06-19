const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const assets = ['obj', 'text', 'fonts', 'models', 'env', 'anim', 'saves', 'sounds', 'txt', "settings"];

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  ...assets.map(asset => {
    return new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'public', asset),
        to: path.resolve(__dirname, '.webpack/renderer', asset)
      }
    ])
  })
];
