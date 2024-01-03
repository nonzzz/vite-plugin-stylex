import * as stylex from '@stylexjs/stylex'

const DARK = '@media (prefers-color-scheme: dark)'

export const colors = stylex.defineVars({ 
  primary: { default: '#fff', [DARK]: '#000' },
  primaryDark: { default: '#ccc', [DARK]: '#333' },
  bg: { default: '#fff', [DARK]: '#000' },
  white: { default: '#fff', [DARK]: '#000' },
  black: { default: '#000', [DARK]: '#fff' }
})
