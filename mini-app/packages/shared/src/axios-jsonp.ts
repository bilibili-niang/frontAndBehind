let cid = 1

function buildParams(params: Record<string, any>): string {
  const result: string[] = []

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      result.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    }
  }

  return result.join('&')
}

interface Config {
  url: string
  params?: Record<string, any>
  callbackParamName?: string
  cancelToken?: { promise: Promise<any> }
}

export default function jsonpAdapter(config: Config): Promise<any> {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script')
    let src = config.url

    if (config.params) {
      const params = buildParams(config.params)

      if (params) {
        src += (src.indexOf('?') >= 0 ? '&' : '?') + params
      }
    }

    script.async = true

    function remove() {
      if (script) {
        script.onload = script.onreadystatechange = script.onerror = null

        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }

        script = null
      }
    }

    const jsonp = 'axiosJsonpCallback' + cid++
    const old = (window as any)[jsonp]
    let isAbort = false

    ;(window as any)[jsonp] = function (responseData: any) {
      ;(window as any)[jsonp] = old

      if (isAbort) {
        return
      }

      const response = {
        data: responseData,
        status: 200
      }

      resolve(response)
    }

    const additionalParams: Record<string, any> = {
      _: new Date().getTime()
    }

    additionalParams[config.callbackParamName || 'callback'] = jsonp

    src += (src.indexOf('?') >= 0 ? '&' : '?') + buildParams(additionalParams)

    script.onload = script.onreadystatechange = function () {
      if (!script.readyState || /loaded|complete/.test(script.readyState)) {
        remove()
      }
    }

    script.onerror = function () {
      remove()
      reject(new Error('Network Error'))
    }

    if (config.cancelToken) {
      config.cancelToken.promise.then(cancel => {
        if (!script) {
          return
        }

        isAbort = true
        reject(cancel)
      })
    }

    script.src = src
    document.head.appendChild(script)
  })
}
