declare module 'dts-module' {
  const src: 'dts-module'
  export default src
}

declare module 'another-dts-module' {
  export interface Foo {
    src: 'dts-module',
  }
}

export type { Type } from 'dts-module'
