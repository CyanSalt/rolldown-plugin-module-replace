declare module 'dmts-replacement' {
  const src: 'dmts-module'
  export default src
}

declare module 'another-dmts-module' {
  export interface Foo {
    src: 'dmts-module',
  }
}

export type { Type } from 'dmts-replacement'
