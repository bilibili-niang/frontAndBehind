export const withUnit = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return undefined
  }
  return `${value}rem`
}

export * from './date'
export * from './json'
export * from './px2rem'