# rolldown-plugin-module-replace

[![npm](https://img.shields.io/npm/v/markdowntown.svg)](https://www.npmjs.com/package/markdowntown)

Replace aliases for bundle dependencies.

## Installation

```shell
pnpm add -D rolldown-plugin-module-replace
```

## Usage

```ts
import moduleReplace from 'rolldown-plugin-module-replace'

export default defineConfig({
  plugins: [
    moduleReplace({
      entries: [
        { find: 'foo', replacement: 'bar' },
      ],
    }),
  ],
})
```

## Why is this plugin needed?

Rolldown itself supports `resolve.alias`. However, it will be called at the `resolveId` stage. This means that `resolve.alias` actually affects imports of **source code**, not imports of **bundles**. It has no effect for generated code, such as `.d.ts` files.

A perhaps less common use case is that, you might declare your dependencies like the following to properly handle version compatibility logics:

```json
{
  "devDependencies": {
    "my-module": "^2.0.0",
    "my-module-v1": "npm:my-module@^1.0.0"
  },
  "peerDependencies": {
    "my-module": ">=1.0.0"
  }
}
```

And you may use these two modules at multiple entry points in your code. At this point, you might encounter the following situations:

- If you leave them unhandled, both `my-module` and `my-module-v1` will be added in the bundles. Therefore, `my-module` must be declared as an external module.

- If you transform `my-module-v1` into `my-module` with `resolve.alias`, the bundles will contain a local path of `my-module@^2.0.0` since the processing time for external modules has passed.

- If `my-module-v1` is treated as an external module, the bundles will retain the import of `my-module-v1`, while this dependency does not exist at runtime.

To solve this problem, this plugin re-parses the bundle code and performs module replacement after the chunk is built. This is essentially what [typescript-transform-aliases](https://github.com/CyanSalt/typescript-transform-aliases) does.
