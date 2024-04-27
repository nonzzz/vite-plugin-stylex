import type { HookHandler, Plugin } from 'vite'

type Next<K extends keyof Plugin> = (
  fn: NonNullable<HookHandler<Plugin[K]>>,
  context: ThisParameterType<NonNullable<HookHandler<Plugin[K]>>>,
  args: NonNullable<Parameters<HookHandler<Plugin[K]>>>,
) => ReturnType<HookHandler<Plugin[K]>>

export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>): void
export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>, executable: false): void
export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>, executable: true): (...args: Parameters<Next<K>>[2]) => ReturnType<Next<K>>
export function hijackHook<K extends keyof Plugin>(plugin: Plugin, name: K, next: Next<K>, executable = false) {
  if (!plugin[name]) throw new Error(`[vite-plugin-stylex-dev]: ${name} haven't implement yet.`)
  const hook = plugin[name] as any
  if ('handler' in hook) {
    const fn = hook.handler
    hook.handler = function (this, ...args: any) {
      return next(fn, this, args)
    }
    if (executable) return hook.handler
  } else {
    const fn = hook
    plugin[name] = function (this: any, ...args: any) {
      return next(fn, this, args)
    }
    if (executable) return plugin[name]
  }
}
