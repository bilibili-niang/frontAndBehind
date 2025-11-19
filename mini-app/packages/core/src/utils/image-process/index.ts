import { resize, type ImageProcessResizeOptions } from './resize'

export { resize as withImageResize }

export type ImageProcess<T> = keyof T extends infer U ? (U extends keyof T ? U : never) : never

type ImageProcessActions = {
  resize: ImageProcessResizeOptions
}

/**
 *
 * @param image - 图片链接
 * @param options - 选项
 * @returns
 */
export const withImageProcess = <T extends keyof ImageProcessActions>(
  image: string,
  action: T,
  options: ImageProcessActions[T]
) => {
  // TODO 这里先判断下cdn域名？

  switch (action) {
    case 'resize':
      return resize(image, options as ImageProcessActions['resize'])
    default:
      return image
  }
}
