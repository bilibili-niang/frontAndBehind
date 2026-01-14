export const pad = (n: number) => String(n).padStart(2, '0')

export const formatDate = (input: string | number | Date, pattern = 'YYYY-MM-DD HH:mm:ss') => {
  if (!input) return ''
  const d = new Date(input)
  if (isNaN(d.getTime())) return ''
  const map: Record<string, string> = {
    YYYY: String(d.getFullYear()),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds())
  }
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (k) => map[k])
}

export const fromISOToDateTime = (iso: string) => formatDate(iso, 'YYYY-MM-DD HH:mm:ss')