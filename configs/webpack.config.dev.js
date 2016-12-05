var path = require('path')
var common = require('./webpack.config.common')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = Object.assign({}, common, {
  output: Object.assign({}, common.output, {
    path: path.join(__dirname, '../dev')
  }),
  plugins: [
    ...common.plugins,
    new HtmlWebpackPlugin({ template: 'src/index.html' })
  ],
  devServer: {
    contentBase: path.join(__dirname, '../dev'),
    historyApiFallback: true,
    port: 3000,
    stats: 'minimal'
  }
})
