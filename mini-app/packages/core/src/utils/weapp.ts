function getQueryParams(queryString) {
  var params = {}
  var pairs = queryString.split('&')

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=')
    params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }

  return params
}

/** 获取小程序码中scene的值 */
export const getWeappQrcodeSceneValue = (scene: string | undefined, key: string) => {
  if (!scene) return ''
  try {
    return getQueryParams(decodeURIComponent(scene))[key] ?? ''
  } catch (err) {
    return ''
  }
}

export const getWeappQrcodeScene = (scene: string | undefined) => {
  if (!scene) return {}
  try {
    return getQueryParams(decodeURIComponent(scene)) ?? {}
  } catch (err) {
    return {}
  }
}
