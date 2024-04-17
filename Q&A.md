> Why i can't see the style work?

- Normally you won't inject virtual module in your local code. But every framework has it own ideas so sometimes you can't see the style inject in your page,so you need inject them manully.Just import `import '@stylex-dev.css'` in your entry file.

> What's optimizedDeps?

- `optimizedDeps` is work for that which file or libraries contain stylex you need to exclude with vite. For details please see [#12](https://github.com/nonzzz/vite-plugin-stylex/issues/12). This option can help you set them up.

> Should i need config for path aliase?

- No, you no need to config path alias for this plugin. all alias will be automatically set.

> What's manuallyControlCssOrder?

- For example, css variables are defined in the entry css file but the order of stylex injection can't read them. So you can using this option to ensure the behavior. Full details see [remix-demo](./examples/remix-demo)