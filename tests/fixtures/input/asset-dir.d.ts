declare module 'dts-module/dir/file' {
  const src: 'dts-module'
  export default src
}

declare module 'another-dts-module/dir/file' {
  export interface Foo {
    src: 'dts-module',
  }
}

export type { Type } from 'dts-module/dir/file'
