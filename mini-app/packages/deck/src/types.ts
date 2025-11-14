import { DefineComponent } from 'vue'

export type DeckComponentDefine = DefineComponent<{
  config: DeckComponentConfig
}>

export type DeckComponentItem = {
  id: string
  key: string
  parent?: string
  config: DeckComponentConfig
  attrs: DeckComponentAttrs
}

export type DeckComponentConfig<T = {}> = T & Record<string, any>

export type DeckComponentAttrs = {
  backgroundEnable: boolean
  background: string
  opacity: number
  borderRadius: [number, number, number, number]
  border: {
    enable: boolean
    shape: 'solid' | 'dashed' | 'dotted'
    width: number
    color: string
  }
  margin: [number, number, number, number]
  padding: [number, number, number, number]
  overflow: 'visible' | 'hidden'
}
