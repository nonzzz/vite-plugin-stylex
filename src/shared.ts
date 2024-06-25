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

export function hash(str: string) {
  let i
  let l
  let hval = 0x811C9DC5

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }
  return (`00000${(hval >>> 0).toString(36)}`).slice(-6)
}
