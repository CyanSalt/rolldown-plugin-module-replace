import bar from 'another-mjs-module'
import foo from 'mjs-module'

export const that = foo(bar)

export { id } from 'mjs-module'

export const load = () => import('mjs-module')
