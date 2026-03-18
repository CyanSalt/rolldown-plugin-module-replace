import path from 'node:path'
import type { Plugin } from 'rolldown'
import { replace } from './replace'
import type { Alias, ModuleReplaceOptions } from './types'

function moduleReplace(options: ModuleReplaceOptions = {}): Plugin {
  return {
    name: 'module-replace',
    async generateBundle(outputOptions, bundle) {
      const aliases = Array.isArray(options.entries)
        ? options.entries
        : Object.entries(options.entries ?? {}).map(([find, replacement]): Alias => ({ find, replacement }))
      await Promise.all(Object.values(bundle).map(async (file) => {
        switch (file.type) {
          case 'chunk':
            file.code = await replace(file.code, file.fileName, aliases)
            break
          case 'asset': {
            const extname = path.extname(file.fileName)
            if (['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts'].includes(extname)) {
              file.source = await replace(file.source.toString(), file.fileName, aliases)
            }
            break
          }
        }
      }))
    },
  }
}

export default moduleReplace
