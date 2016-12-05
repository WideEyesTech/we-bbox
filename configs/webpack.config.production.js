var path = require('path')
var common = require('./webpack.config.common')

module.exports = Object.assign({}, common, {
  output: Object.assign({}, common.output, {
    path: path.join(__dirname, '../')
  })
})
