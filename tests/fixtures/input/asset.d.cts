declare module 'dcts-module' {
  const src: 'dcts-module'
  export default src
}

declare module 'another-dcts-module' {
  export interface Foo {
    src: 'dcts-module',
  }
}
