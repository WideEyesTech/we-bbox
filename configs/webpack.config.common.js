var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: path.join(__dirname, '../src/index.js'),
  output: {
    filename: 'index.js',
    library: 'Bbox',
    libraryTarget: 'umd',
    publicPath: '/'
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules)/,
      loader: 'babel', // 'babel-loader' is also a legal name to reference
      query: { presets: ['es2015'] }
    }]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin()
  ]
}
