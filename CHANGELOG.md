## 0.6.2

# Patches

- Fix side effect of bunding phase can't handle import with raw suffix.

## 0.6.1

# Patches

- Fix missing sync byte offset.

## 0.6.0

# Features & Improves

- Add new option `enableStylexExtend`.
- Split project layout.
- Provide rollup adapter.

## 0.5.2

# Improve

- Remove unnecessary babel plugins.

# Patches

- Fix the id of `manuallyControlCssOrder` should be unix like.
- Respect `isProduction`.

# Chore

- Remove `es-mdoule-lexer`.
- Upgrade `@stylexjs/babel-plugin` version.

## 0.5.1

# Patches

- Fix option `manuallyControlCssOrder` typo.

## 0.5.0

# Features

- Add `manuallyControlCssOrder` option

# Patches

- Fix development mode can't pass css with vite internal handle.

## 0.4.1

# Patches

- Fix no passing option `importSources` for stylex babel-plugin.

## 0.4.0

# Features

- Add new Option `optimizedDeps` #12

## 0.3.0

# Improve and Features

- Upgrade stylex compiler.
- Perf patchAlias logic.
- Reduce package sizes.

# Patches

- Fix can't load `virtual:css` in watch mode. #5

## 0.2.5

# Patches

- Fix transform filter don't work as expected. #1

## 0.2.4

# Patches

- Fix patchAlias can't work with windows system.
- Fix input code include empty stylex object can't work. #10

## 0.2.2

# Patches

- Fix if it's `https` or `http`.

## 0.2.1

# Patches

- Remove `rs-module-lexer` using `es-module-lexer`.

## 0.2.0

# Features & Improves

- Support paths alias. #6
- Rename `stylexImports` to `importSources`

# Patches

- Fix hmr error with nuxt.
- Fix `@stylexjs/open-props` can't work.
