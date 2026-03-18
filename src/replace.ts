import MagicString from 'magic-string'
import type { ModuleKind } from 'oxc-parser'
import { parse } from 'oxc-parser'
import { walk } from 'oxc-walker'
import type { Alias } from './types'

function filterAlias(aliases: Alias[], sourceType: ModuleKind) {
  return aliases.filter(alias => {
    if (alias.sourceType && alias.sourceType !== sourceType) return false
    return true
  })
}

function findAlias(request: string, aliases: Alias[]) {
  return aliases.find(alias => {
    if (typeof alias.find === 'string') {
      return alias.find === request
    }
    return alias.find.test(request)
  })
}

function replaceByAlias(request: string, alias: Alias) {
  if (typeof alias.find === 'string') {
    return alias.replacement
  }
  return request.replace(alias.find, alias.replacement)
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

export async function replace(code: string, filename: string, entries: Alias[]) {
  const ms = new MagicString(code)
  const { program, module } = await parse(filename, code)
  const aliases = filterAlias(entries, program.sourceType)
  // import ... from 'module'
  for (const stmt of module.staticImports) {
    const alias = findAlias(stmt.moduleRequest.value, aliases)
    if (alias) {
      ms.overwrite(
        stmt.moduleRequest.start + 1,
        stmt.moduleRequest.end - 1,
        replaceByAlias(stmt.moduleRequest.value, alias),
      )
    }
  }
  // export ... from 'module'
  for (const stmt of module.staticExports) {
    for (const entry of stmt.entries) {
      const alias = entry.moduleRequest?.value
        ? findAlias(entry.moduleRequest.value, aliases)
        : undefined
      if (alias) {
        ms.overwrite(
          entry.moduleRequest!.start + 1,
          entry.moduleRequest!.end - 1,
          replaceByAlias(entry.moduleRequest!.value, alias),
        )
      }
    }
  }
  // import('module')
  for (const stmt of module.dynamicImports) {
    const source = code.slice(stmt.moduleRequest.start, stmt.moduleRequest.end)
    const parsed = parseStringLiteral(source)
    if (parsed) {
      const alias = findAlias(parsed.value, aliases)
      if (alias) {
        ms.overwrite(
          stmt.moduleRequest.start + 1,
          stmt.moduleRequest.end - 1,
          replaceByAlias(parsed.value, alias),
        )
      }
    }
  }
  walk(program, {
    enter(node) {
      switch (node.type) {
        case 'TSModuleDeclaration':
          if (node.id.type === 'Literal') {
            const alias = findAlias(node.id.value, aliases)
            if (alias) {
              ms.overwrite(
                node.id.start + 1,
                node.id.end - 1,
                replaceByAlias(node.id.value, alias),
              )
            }
          }
          break
        case 'CallExpression':
          if (node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments.length >= 1) {
            const arg = node.arguments[0]
            if (arg.type === 'Literal' && typeof arg.value === 'string') {
              const alias = findAlias(arg.value, aliases)
              if (alias) {
                ms.overwrite(
                  arg.start + 1,
                  arg.end - 1,
                  replaceByAlias(arg.value, alias),
                )
              }
            }
          }
          break
        default:
          break
      }
    },
  })

  return ms.toString()
}
