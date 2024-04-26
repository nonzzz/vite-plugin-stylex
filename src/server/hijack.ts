import type { HookHandler, Plugin } from 'vite'

type Next<K extends keyof Plugin> = (
  fn: NonNullable<HookHandler<Plugin[K]>>,
  context: ThisParameterType<NonNullable<HookHandler<Plugin[K]>>>,
  args: NonNullable<Parameters<HookHandler<Plugin[K]>>>,
) => ReturnType<HookHandler<Plugin[K]>>

export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>): undefined
export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>, executable: false): undefined
export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>, executable: true): Plugin[K]
export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>, executable = false) {
  if (!plugin[name]) throw new Error(`[vite-plugin-stylex-dev]: ${name} haven't implement yet.`)
  const hook = plugin[name] as any
  if ('handler' in hook) {
    const fn = hook.handler
    hook.handler = function (this, ...args: any) {
      return next(fn, this, args)
    }
    if (executable) return hook as Plugin[K]
  } else {
    const fn = hook
    plugin[name] = function (this: any, ...args: any) {
      return next(fn, this, args)
    }
    if (executable) return plugin[name] as Plugin[K]
  }
}
