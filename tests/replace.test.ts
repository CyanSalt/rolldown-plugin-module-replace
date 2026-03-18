import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { replace } from '../src/replace'
import type { Alias } from '../src/types'

async function read(id: string) {
  const file = fileURLToPath(import.meta.resolve(id))
  return fs.readFile(file, 'utf8')
}

async function transform(id: string, aliases: Alias[]) {
  const file = fileURLToPath(import.meta.resolve(id))
  const content = await fs.readFile(file, 'utf8')
  return replace(content, file, aliases)
}

describe('replace', () => {

  test('.d.ts', async () => {
    await expect(transform('./fixtures/input/asset.d.ts', [
      { find: 'dts-module', replacement: 'dts-replacement' },
    ]))
      .resolves
      .toBe(await read('./fixtures/output/asset.d.ts'))
  })

  test('.d.cts', async () => {
    await expect(transform('./fixtures/input/asset.d.cts', [
      { find: 'dcts-module', replacement: 'dcts-replacement' },
    ]))
      .resolves
      .toBe(await read('./fixtures/output/asset.d.cts'))
  })

  test('.d.mts', async () => {
    await expect(transform('./fixtures/input/asset.d.mts', [
      { find: 'dmts-module', replacement: 'dmts-replacement' },
    ]))
      .resolves
      .toBe(await read('./fixtures/output/asset.d.mts'))
  })

  test('.cjs', async () => {
    await expect(transform('./fixtures/input/chunk.cjs', [
      { find: 'cjs-module', replacement: 'cjs-replacement' },
    ]))
      .resolves
      .toBe(await read('./fixtures/output/chunk.cjs'))
  })

  test('.mjs', async () => {
    await expect(transform('./fixtures/input/chunk.mjs', [
      { find: 'mjs-module', replacement: 'mjs-replacement' },
    ]))
      .resolves
      .toBe(await read('./fixtures/output/chunk.mjs'))
  })

})

describe('replace with source type', () => {

  test('commonjs for commonjs', async () => {
    await expect(transform('./fixtures/input/chunk.cjs', [
      { find: 'cjs-module', replacement: 'cjs-replacement', sourceType: 'commonjs' },
    ]))
      .resolves
      .toBe(await read('./fixtures/output/chunk.cjs'))
  })

  test('module for commonjs', async () => {
    await expect(transform('./fixtures/input/chunk.cjs', [
      { find: 'cjs-module', replacement: 'cjs-replacement', sourceType: 'module' },
    ]))
      .resolves
      .toBe(await read('./fixtures/input/chunk.cjs'))
  })

  test('commonjs for module', async () => {
    await expect(transform('./fixtures/input/chunk.mjs', [
      { find: 'mjs-module', replacement: 'mjs-replacement', sourceType: 'commonjs' },
    ]))
      .resolves
      .toBe(await read('./fixtures/input/chunk.mjs'))
  })

  test('module for module', async () => {
    await expect(transform('./fixtures/input/chunk.mjs', [
      { find: 'mjs-module', replacement: 'mjs-replacement', sourceType: 'module' },
    ]))
      .resolves
      .toBe(await read('./fixtures/output/chunk.mjs'))
  })

})

describe('replace with regexp', () => {

  test('dirs', async () => {
    await expect(transform('./fixtures/input/asset-dir.d.ts', [
      { find: /^dts-module(?=$|\/)/, replacement: 'dts-replacement' },
    ]))
      .resolves
      .toBe(await read('./fixtures/output/asset-dir.d.ts'))
  })

})
