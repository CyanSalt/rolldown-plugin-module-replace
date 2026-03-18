export interface Alias {
  find: string | RegExp,
  replacement: string,
}

export interface ModuleReplaceOptions {
  entries?: Alias[] | Record<string, string>,
}
