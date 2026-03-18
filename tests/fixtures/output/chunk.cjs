const bar = require('another-cjs-module')
const foo = require('cjs-replacement')

exports.that = foo(bar)

exports.id = require('cjs-replacement').id

exports.load = () => import('cjs-replacement')
