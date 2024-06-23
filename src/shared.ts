import fs from 'fs'
import path from 'path'

import type { HookHandler, Plugin } from 'vite'

export function noop() {}

export function unique<T>(data: T[]) {
  return Array.from(new Set(data))
}

export function error(message: string) {
  throw new Error(`[vite-plugin-stylex-dev]: ${message}`)
}

type Next<K extends keyof Plugin> = (
  fn: NonNullable<HookHandler<Plugin[K]>>,
  context: ThisParameterType<NonNullable<HookHandler<Plugin[K]>>>,
  args: NonNullable<Parameters<HookHandler<Plugin[K]>>>
) => ReturnType<HookHandler<Plugin[K]>>

export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>): void
export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>, executable: false): void
export function hijackHook<K extends keyof Plugin>(
  plugin: Plugin,
  name: K,
  next: Next<K>,
  executable: true
): (...args: Parameters<Next<K>>[2]) => ReturnType<Next<K>>
export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>, executable = false) {
  if (!plugin[name]) throw error(`'${name}' haven't implement yet.`)
  const hook = plugin[name] as any
  if ('handler' in hook) {
    const fn = hook.handler
    hook.handler = function handler(this: any, ...args: any) {
      return next(fn, this, args)
    }
    if (executable) return hook.handler
  } else {
    const fn = hook
    plugin[name] = function handler(this: any, ...args: any) {
      return next(fn, this, args)
    }
    if (executable) return plugin[name]
  }
}

// MIT License
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
export function slash(path: string) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path)
  if (isExtendedLengthPath) return path
  return path.replace(/\\/g, '/')
}

// MIT License
// Copyright (c) Vite

export function tryStatSync(file: string): fs.Stats | undefined {
  try {
    // The "throwIfNoEntry" is a performance optimization for cases where the file does not exist
    return fs.statSync(file, { throwIfNoEntry: false })
  } catch {
    // Ignore errors
  }
}

export function isFileReadable(filename: string): boolean {
  if (!tryStatSync(filename)) {
    return false
  }

  try {
    // Check if current process has read permission to the file
    fs.accessSync(filename, fs.constants.R_OK)

    return true
  } catch {
    return false
  }
}

const ROOT_FILES = ['pnpm-workspace.yaml', 'lerna.json']

// npm: https://docs.npmjs.com/cli/v7/using-npm/workspaces#installing-workspaces
// yarn: https://classic.yarnpkg.com/en/docs/workspaces/#toc-how-to-use-it
function hasWorkspacePackageJSON(root: string): boolean {
  const s = path.join(root, 'package.json')
  if (!isFileReadable(s)) {
    return false
  }
  try {
    const content = JSON.parse(fs.readFileSync(s, 'utf-8')) || {}
    return !!content.workspaces
  } catch {
    return false
  }
}

function hasRootFile(root: string): boolean {
  return ROOT_FILES.some((file) => fs.existsSync(path.join(root, file)))
}

function hasPackageJSON(root: string) {
  const s = path.join(root, 'package.json')
  return fs.existsSync(s)
}

/**
 * Search up for the nearest `package.json`
 */
export function searchForPackageRoot(current: string, root = current): string {
  if (hasPackageJSON(current)) return current

  const dir = path.dirname(current)
  // reach the fs root
  if (!dir || dir === current) return root

  return searchForPackageRoot(dir, root)
}

/**
 * Search up for the nearest workspace root
 */

export function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current)
): string {
  if (hasRootFile(current)) return current
  if (hasWorkspacePackageJSON(current)) return current

  const dir = path.dirname(current)
  // reach the fs root
  if (!dir || dir === current) return root

  return searchForWorkspaceRoot(dir, root)
}

/* eslint-disable no-fallthrough */

/**
 * JS Implementation of MurmurHash2
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} str ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
function murmurhash2_32_gc(str: string, seed: number = 0) {
  let l = str.length
  let h = seed ^ l
  let i = 0
  let k

  while (l >= 4) {
    k = (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(++i) & 0xff) << 8) |
      ((str.charCodeAt(++i) & 0xff) << 16) |
      ((str.charCodeAt(++i) & 0xff) << 24)

    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16)
    k ^= k >>> 24
    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16)

    h = ((h & 0xffff) * 0x5bd1e995 +
      ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^
      k

    l -= 4 // eslint-disable-next-line stylistic/semi
    ;++i
  }

  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8
    case 1:
      h ^= str.charCodeAt(i) & 0xff
      h = (h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)
  }

  h ^= h >>> 13
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)
  h ^= h >>> 15

  return h >>> 0
}

export function hash(str: string): string {
  return murmurhash2_32_gc(str, 1).toString(36)
}
