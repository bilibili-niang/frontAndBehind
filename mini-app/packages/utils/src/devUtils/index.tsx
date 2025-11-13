export const isDev = (a: any) => {
  if (process.env.NODE_ENV === 'development') {
    return typeof a === 'function' ? a() : a
  }
  return process.env.NODE_ENV === 'development'
}
