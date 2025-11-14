import { h, PropType, VNode } from 'vue'

export type AnyNodePropType = string | number | boolean | any[] | Record<string, any> | (() => VNode) | VNode

export const AnyNodePropTypeDefine = [
  String,
  Number,
  Boolean,
  Array,
  Object,
  Function,
  Object as PropType<VNode>
] as PropType<AnyNodePropType>

export const renderAnyNode = (node: any): VNode | string | number | boolean | any[] => {
  if (typeof node === 'object' && node !== null && 'type' in node) {
    return h(node)
  } else if (typeof node === 'function') {
    return node()
  } else {
    return node
  }
}
