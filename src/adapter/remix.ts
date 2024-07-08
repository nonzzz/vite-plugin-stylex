import type { Plugin } from 'vite'
import type { ScannerAPI } from '../plugins/server'
import type { AdapterConfig } from '../interface'

export function remix() {
  return <AdapterConfig> {
    name: 'remix',
    setup(self, { context, vite, transform }) {
      if (!context.isManuallyControlCSS) return
      const scanner = vite.config.plugins.find(p => p.name === 'stylex:server-scan')
      const { entries, effects } = scanner?.api as ScannerAPI

      const plugin = <Partial<Plugin>> {
        // handleHotUpdate(ctx) {
        //   // for (const id of entries) {
        //   //   ctx.addModuleUpdate(id)
        //   // }
        // }
      }

      Object.assign(self, plugin)
    }
  }
}
