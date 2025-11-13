export default (content = '', callback: (content: string) => void) => {
  let editor: Window = null as any
  function onContentFrom135(event: any) {
    if (event.origin === 'https://www.135editor.com') {
      // console.log(event)
    }
    if (typeof event.data !== 'string') {
      if (event.data.ready) {
        editor.postMessage(content ?? '', '*')
      }
      return
    }

    if (event.data.indexOf('<') !== 0) return
    callback?.(event.data)
    window.removeEventListener('message', onContentFrom135)
  }
  // @ts-ignore
  editor = window.open('https://www.135editor.com/beautify_editor.html?callback=true')!
  window.removeEventListener('message', onContentFrom135)
  window.addEventListener('message', onContentFrom135, false)
}
