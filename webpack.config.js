var webpack = require('webpack')

module.exports = {
  context: __dirname,
  entry: "./bbox",
  output: {
    filename: "index.min.js",
    library: "Bbox",
    libraryTarget: "umd",
    path: __dirname + "/dist",
  },
  externals: {
    'Rx': 'rx'
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
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }),
  ]
}
