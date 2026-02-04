const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`)

export const formatDateTime = (input?: Date | string | number | null) => {
  if (!input) return null as any
  const d = new Date(input)
  if (isNaN(d.getTime())) return null as any
  const year = d.getFullYear()
  const month = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  const hour = pad2(d.getHours())
  const minute = pad2(d.getMinutes())
  const second = pad2(d.getSeconds())
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export const formatDate = (input?: Date | string | number | null) => {
  if (!input) return null as any
  const d = new Date(input)
  if (isNaN(d.getTime())) return null as any
  const year = d.getFullYear()
  const month = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  return `${year}-${month}-${day}`
}