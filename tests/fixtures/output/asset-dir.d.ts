declare module 'dts-replacement/dir/file' {
  const src: 'dts-module'
  export default src
}

declare module 'another-dts-module/dir/file' {
  export interface Foo {
    src: 'dts-module',
  }
}

export type { Type } from 'dts-replacement/dir/file'
