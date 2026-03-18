import type { ModuleKind } from 'oxc-parser'

export interface Alias {
  find: string | RegExp,
  replacement: string,
  sourceType?: ModuleKind,
}

export interface ModuleReplaceOptions {
  entries?: Alias[] | Record<string, string>,
}
