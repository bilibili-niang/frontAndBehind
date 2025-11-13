import { defaults } from 'lodash'

export type DecorationComponentConfig = {
  key: string
  name: string
  version: string
  thumbnail?: string
  images?: string[]
  type: 'common' | 'business' | 'page'
  render: () => any
  implicit?: boolean
  unordered?: boolean
}

export const defineDecorationComponent = (config: DecorationComponentConfig) => {
  const { render, ...manifest } = config
  return {
    ...config,
    render: () =>
      config.render().then((res) => {
        defaults(res.manifest, manifest)
        return res
      })
  }
}