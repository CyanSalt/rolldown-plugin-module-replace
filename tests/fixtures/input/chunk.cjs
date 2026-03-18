const bar = require('another-cjs-module')
const foo = require('cjs-module')

exports.that = foo(bar)

exports.id = require('cjs-module').id

exports.load = () => import('cjs-module')
