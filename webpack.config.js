var webpack = require('webpack')

module.exports = {
  context: __dirname,
  entry: "./bbox",
  output: {
    filename: "bbox.min.js",
    library: "Bbox",
    libraryTarget: "var",
    path: __dirname + "/dist",
  },
  externals: {
    "rx": "Rx"
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel', // 'babel-loader' is also a legal name to reference
      query: {
        presets: ['es2015']
      }
    }]
  },
  plugins: [
    // new webpack.BannerPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ]
}
