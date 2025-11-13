/*
 * 你可以在 SchemaForm 的schema -> properties -> 字段 -> config里指定一个 widgetRef,然后通过ref控制组件的暴露属性/function
 * */
export const mountWidgetRef = (extendProps: any) => {
  if (extendProps?.schema?.config) {
    return {
      ref: extendProps?.schema?.config?.widgetRef
    }
  } else {
    return {}
  }
}
