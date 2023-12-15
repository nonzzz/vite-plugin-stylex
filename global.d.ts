declare module '@stylexjs/babel-plugin'{
  export type Rule = [string, { ltr: string; rtl?: null | string }, number]
  declare type StyleXTransformObj = Readonly<{
    (): PluginObj
    processStylexRules: typeof processStylexRules;
  }>

  declare const $$EXPORT_DEFAULT_DECLARATION$$: StyleXTransformObj
  export default $$EXPORT_DEFAULT_DECLARATION$$
}
