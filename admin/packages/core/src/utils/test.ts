/**
 * 验证手机格式
 */
function mobile(value: string): boolean {
  return /^1[23456789]\d{9}$/.test(value)
}

/**
 * 是否短信验证码
 */
function code(value: string, len: number | string = 6): boolean {
  return new RegExp(`^\\d{${len}}$`).test(value)
}

function video(value: string): boolean {
  // .mp4, .mov, .m4v, .flv, .x-flv, .mkv, .wmv, .avi, .rmvb, .3gp
  const videoFileRegex = /\.mp4$|\.mov$|\.avi$|\.mpg$|\.mpeg$|\.flv$|\.wmv$|\.mkv$|\.webm$|\.3gp$/i
  return videoFileRegex.test(value)
}

function audio(value: string): boolean {
  const audioFileRegex = /\.(?:mp3|wav|ogg|flac|aac)$/i
  return audioFileRegex.test(value)
}

function image(value: string): boolean {
  const imageFileRegex = /\.(?:jpe?g|png|gif|bmp|webp|tiff?|svg|ico)$/i
  return imageFileRegex.test(value)
}

const test = {
  mobile,
  code,
  video,
  audio,
  image
}

export default test
