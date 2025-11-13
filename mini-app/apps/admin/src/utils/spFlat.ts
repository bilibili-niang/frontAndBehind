// 为数组中指定的key拍平
export function flattenOptions(options: any[]) {
  let result = []

  options.forEach((option) => {
    // 提取当前项的 value 和 label
    const flatOption = { value: option.value, label: option.label }
    result.push(flatOption)

    // 如果有 children，则递归调用 flattenOptions
    if (option.children) {
      const children = flattenOptions(option.children)
      result = result.concat(children)
    }
  })
  return result
}
