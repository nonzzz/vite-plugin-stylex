# vite-plugin-stylex

> [!WARNING]
> This is a development branch for stylex vite plugin. Each feature will be pass in the repo.
> This is an unofficial repo.

## Features

- [x] SSR
- [x] automatic injection
- [x] HMR

## Usage

Clone repo and install all dependencies then run `yarn build` and copy the dist directroy to your project.

```ts
import { defineConfig } from "vite";
import { stylexPlugin } from "vite-plugin-stylex";

export default defineConfig({
  plugins: [stylexPlugin()],
});
```

## Options

| params                      | type                                          | default                                        | description                                                |
| --------------------------- | --------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| `include`                   | `string \| RegExp \| Array<string \| RegExp>` | `/\.(mjs\|js\|ts\|vue\|jsx\|tsx)(\?.*\|)$/`    | Include all assets matching any of these conditions.       |
| `exclude`                   | `string \| RegExp \| Array<string \| RegExp>` | `-`                                            | Exclude all assets matching any of these conditions.       |
| `stylexImports`             | `string[]`                                    | `['stylex', '@stylexjs/stylex']`               | Only assets bigger than this size are processed (in bytes) |
| `babelConfig`               | `object`                                      | `{}`                                           | Babel config for stylex                                    |
| `unstable_moduleResolution` | `Record<string,any>`                          | `{ type: 'commonJS', rootDir: process.cwd() }` | See stylex document                                        |

## Author

Kanno
