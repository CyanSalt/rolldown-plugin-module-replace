import MagicString from 'magic-string'
import { parse } from 'oxc-parser'
import { walk } from 'oxc-walker'
import type { Alias } from './types'

function matchAlias(request: string, aliases: Alias[]) {
  return aliases.find(alias => {
    if (typeof alias.find === 'string') {
      return alias.find === request
    }
    return alias.find.test(request)
  })
}

function parseStringLiteral(raw: string) {
  if (raw.length > 2 && raw[0] === raw[raw.length - 1]) {
    const quote = raw[0]
    const value = raw.slice(1, -1)
    if (quote === '"' || quote === '\'') {
      return { quote, value }
    }
  }
  return undefined
}

export async function replace(code: string, filename: string, aliases: Alias[]) {
  const ms = new MagicString(code)
  const { program, module } = await parse(filename, code)
  // import ... from 'module'
  for (const stmt of module.staticImports) {
    const alias = matchAlias(stmt.moduleRequest.value, aliases)
    if (alias) {
      ms.overwrite(stmt.moduleRequest.start + 1, stmt.moduleRequest.end - 1, alias.replacement)
    }
  }
  // export ... from 'module'
  for (const stmt of module.staticExports) {
    for (const entry of stmt.entries) {
      const alias = entry.moduleRequest?.value
        ? matchAlias(entry.moduleRequest.value, aliases)
        : undefined
      if (alias) {
        ms.overwrite(entry.moduleRequest!.start + 1, entry.moduleRequest!.end - 1, alias.replacement)
      }
    }
  }
  // import('module')
  for (const stmt of module.dynamicImports) {
    const source = code.slice(stmt.moduleRequest.start, stmt.moduleRequest.end)
    const parsed = parseStringLiteral(source)
    if (parsed) {
      const alias = matchAlias(parsed.value, aliases)
      if (alias) {
        ms.overwrite(
          stmt.moduleRequest.start + 1,
          stmt.moduleRequest.end - 1,
          alias.replacement,
        )
      }
    }
  }
  walk(program, {
    enter(node) {
      switch (node.type) {
        case 'TSModuleDeclaration':
          if (node.id?.type === 'Literal') {
            const alias = matchAlias(node.id.value, aliases)
            if (alias) {
              ms.overwrite(node.id.start + 1, node.id.end - 1, alias.replacement)
            }
          }
          break
        case 'CallExpression':
          if (node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments.length >= 1) {
            const arg = node.arguments[0]
            if (arg.type === 'Literal' && typeof arg.value === 'string') {
              const alias = matchAlias(arg.value, aliases)
              if (alias) {
                ms.overwrite(arg.start + 1, arg.end - 1, alias.replacement)
              }
            }
          }
      }
    },
  })

  return ms.toString()
}
