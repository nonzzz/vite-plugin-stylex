![vite-plugin-stylex](https://socialify.git.ci/nonzzz/vite-plugin-stylex/image?description=1&font=Jost&language=1&logo=https%3A%2F%2Fvitejs.dev%2Flogo-with-shadow.png&name=1&owner=1&theme=Auto)

> [!WARNING]
> This is an unofficial repo.
> This plugin is dedicated to providing stable stylex integration.

## Features

- [x] CSS automatic injection
- [x] Support HMR
- [x] Control css order by manually
- [x] Support Vite-based SSR framework

## Usage

```bash

$ yarn add vite-plugin-stylex-dev -D

```

```ts
import { defineConfig } from "vite";
import { stylexPlugin } from "vite-plugin-stylex-dev";

export default defineConfig({
  plugins: [stylex()],
});
```

## Options

| params                      | type                                          | default                                        | description                                                |
| --------------------------- | --------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| `include`                   | `string \| RegExp \| Array<string \| RegExp>` | `/\.(mjs\|js\|ts\|vue\|jsx\|tsx)(\?.*\|)$/`    | Include all assets matching any of these conditions.       |
| `exclude`                   | `string \| RegExp \| Array<string \| RegExp>` | `-`                                            | Exclude all assets matching any of these conditions.       |
| `importSources`             | `string[]`                                    | `['stylex', '@stylexjs/stylex']`               | Only assets bigger than this size are processed (in bytes) |
| `babelConfig`               | `object`                                      | `{}`                                           | Babel config for stylex                                    |
| `unstable_moduleResolution` | `Record<string,any>`                          | `{ type: 'commonJS', rootDir: process.cwd() }` | See stylex document                                        |
| `useCSSLayers`              | `boolean`                                     | `default`                                      | See stylex document                                        |
| `optimizedDeps`             | `Array<string>`                               | `[]`                                           | Work with external stylex files or libraries               |
| `manuallyControlCssOrder`   | `boolean \|object`                            | `false`                                        | control css order by manually                              |
| `enableStylexExtend`        | `boolean \| StylexExtendOptions`              | `false`                                        | see `@stylex-extend/babel-plugin` docss                    |

## Q & A

[Q&A](./Q&A.md)

## Author

Kanno

## LICENSE

[MIT](./LICENSE)
