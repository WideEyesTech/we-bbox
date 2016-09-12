var path = require('path')
var webpack = require('webpack')

module.exports = {
  context: __dirname,
  entry: path.join(__dirname, '/src/index.js'),
  output: {
    library: 'Bbox',
    libraryTarget: 'umd',
    filename: 'index.js',
    path: path.join(__dirname, '/lib')
  },
  externals: {
    'Rx': 'rx',
    'isMobile': 'ismobilejs'
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel', // 'babel-loader' is also a legal name to reference
      query: { presets: ['es2015'] }
    }]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin()
  ]
}
