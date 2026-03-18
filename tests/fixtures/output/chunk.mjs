import bar from 'another-mjs-module'
import foo from 'mjs-replacement'

export const that = foo(bar)

export { id } from 'mjs-replacement'

export const load = () => import('mjs-replacement')
