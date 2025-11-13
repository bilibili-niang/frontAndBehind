import { computed, defineComponent, ref, TransitionGroup } from 'vue'
import './style.scss'
import 'highlight.js/styles/github.css'
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import message from '../message'

hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('json', json)

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (e) {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      return ok
    } catch (err) {
      return false
    }
  }
}

type Range = { start: number; end: number }

function isInsideCollapsed(index: number, collapsed: Set<number>, ranges: Range[]) {
  for (const r of ranges) {
    if (collapsed.has(r.start)) {
      if (index > r.start && index < r.end) return true
    }
  }
  return false
}

export default defineComponent({
  name: 'SourceView',
  props: {
    code: { type: String, required: true },
    lang: { type: String, default: 'tsx' },
    filename: { type: String, default: '' },
    height: { type: [String, Number], default: 'auto' },
    showLineNumbers: { type: Boolean, default: true },
  },
  setup(props) {
    const collapsed = ref<Set<number>>(new Set())
    const lines = computed(() => props.code.split(/\r?\n/))

    const startRe = /(\/\/\s*#?region|\/\*\s*#?region\s*\*\/|#region)/i
    const endRe = /(\/\/\s*#?endregion|\/\*\s*#?endregion\s*\*\/|#endregion)/i

    const foldRanges = computed(() => {
      const ranges: Range[] = []
      const stack: number[] = []
      for (let i = 0; i < lines.value.length; i++) {
        const l = lines.value[i]
        if (startRe.test(l)) stack.push(i)
        else if (endRe.test(l)) {
          const s = stack.pop()
          if (s !== undefined) ranges.push({ start: s, end: i })
        }
      }
      if (ranges.length === 0 && lines.value.length > 1) {
        ranges.push({ start: 0, end: lines.value.length - 1 })
      }
      return ranges
    })

    const rangesByStart = computed(() => {
      const m = new Map<number, Range>()
      for (const r of foldRanges.value) m.set(r.start, r)
      return m
    })

    const toggle = (start: number) => {
      const next = new Set(collapsed.value)
      if (next.has(start)) next.delete(start)
      else next.add(start)
      collapsed.value = next
    }
    const collapseAll = () => {
      const next = new Set<number>()
      for (const r of foldRanges.value) next.add(r.start)
      collapsed.value = next
    }
    const expandAll = () => {
      collapsed.value = new Set<number>()
    }

    const isAllCollapsed = computed(() => {
      if (foldRanges.value.length === 0) return false
      for (const r of foldRanges.value) {
        if (!collapsed.value.has(r.start)) return false
      }
      return true
    })
    const toggleAll = () => {
      if (isAllCollapsed.value) expandAll()
      else collapseAll()
    }

    const handleCopy = async () => {
      const ok = await copyText(props.code)
      if (ok) message.success('源码已复制到剪贴板')
      else message.error('复制失败，请手动复制')
    }

    const langMap: Record<string, string> = {
      tsx: 'typescript',
      ts: 'typescript',
      js: 'javascript',
      jsx: 'xml',
      html: 'xml',
      json: 'json',
    }
    const hlLang = computed(() => langMap[props.lang] || 'typescript')

    const renderLine = (line: string, idx: number) => {
      const r = rangesByStart.value.get(idx)
      const isCollapsed = r ? collapsed.value.has(idx) : false

      if (!r && isInsideCollapsed(idx, collapsed.value, foldRanges.value)) return null

      const highlighted = hljs.highlight(line, { language: hlLang.value }).value
      const toggleIcon = r ? (isCollapsed ? '▸' : '▾') : ''
      const toggleClick = r ? () => toggle(idx) : undefined

      if (r && isCollapsed) {
        const hiddenCount = Math.max(0, r.end - r.start - 1)
        return (
          <div class={`source-viewer__line source-viewer__line--collapsed`} key={idx}>
            {props.showLineNumbers && <span class="source-viewer__ln" aria-hidden="true"></span>}
            <span class="source-viewer__toggle" onClick={toggleClick}>{toggleIcon}</span>
            <span class="source-viewer__fold-placeholder" onClick={toggleClick}>已折叠 {hiddenCount} 行，点击展开</span>
          </div>
        )
      }

      return (
        <div class="source-viewer__line" key={idx}>
          {props.showLineNumbers && <span class="source-viewer__ln">{idx + 1}</span>}
          <span class="source-viewer__toggle" onClick={toggleClick}>{toggleIcon}</span>
          <span class="source-viewer__code hljs" innerHTML={highlighted}></span>
        </div>
      )
    }

    return () => {
      const children = lines.value
        .map((line, i) => renderLine(line, i))
        .filter((n) => n)

      return (
        <div class="source-viewer">
          <div class="source-viewer__header">
            <span class="source-viewer__title">{props.filename || '源码'}</span>
            <div class="source-viewer__actions">
              <button class="source-viewer__btn" onClick={handleCopy}>复制</button>
              <button class="source-viewer__btn"
                      onClick={toggleAll}>{isAllCollapsed.value ? '展开全部' : '折叠全部'}</button>
            </div>
          </div>
          <TransitionGroup
            name="fold"
            tag="div"
            class="source-viewer__body"
            style={{ height: typeof props.height === 'number' ? `${props.height}px` : props.height }}
          >
            {children}
          </TransitionGroup>
        </div>
      )
    }
  },
})







