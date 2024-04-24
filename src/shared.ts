import fs from 'fs'
import path from 'path'

export function noop() {
  
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
