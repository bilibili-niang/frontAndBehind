import useToast from './useToast'

export default (res: any, text?: string) => {
  try {
    const msg = res.msg || res.data?.msg || res.response?.data?.msg || res.message || text
    if (msg) {
      useToast(msg)
    }
  } finally {
  }
}
