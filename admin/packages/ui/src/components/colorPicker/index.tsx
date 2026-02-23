import './style.scss'
import { defineComponent, ref, watch, onMounted, onBeforeUnmount, Teleport } from 'vue'
import { InputNumber, Slider } from 'ant-design-vue'
import { PREFIX_CLS } from '@pkg/config'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))
const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return { r, g, b }
}
const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60; if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  const v = max
  return { h, s, v }
}
const hsvToRgb = (h: number, s: number, v: number) => {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0, g = 0, b = 0
  if (h >= 0 && h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) }
}
const parseColor = (c: string) => {
  if (!c) return { r: 0, g: 0, b: 0, a: 1 }
  const m = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)/i)
  if (m) return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 }
  if (c.startsWith('#')) return { ...hexToRgb(c), a: 1 }
  return { r: 0, g: 0, b: 0, a: 1 }
}
const toRgba = (r: number, g: number, b: number, a: number) => `rgba(${clamp(r,0,255)},${clamp(g,0,255)},${clamp(b,0,255)},${clamp(a,0,1)})`

export default defineComponent({
  name: `${PREFIX_CLS}-color-picker`,
  props: {
    modelValue: { type: String, default: '#000000' },
    presets: { type: Array as any, default: () => ['#ffffff','#ffff00','#0000ff','#ff9300','#ff0000','#00ff00','#000000','#808080'] },
    compact: { type: Boolean, default: false },
    showAlpha: { type: Boolean, default: true },
    alphaLabel: { type: String, default: '' },
    inline: { type: Boolean, default: false }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const base = parseColor(props.modelValue)
    const hsv = ref(rgbToHsv(base.r, base.g, base.b))
    const alpha = ref(base.a)
    const rgb = ref({ r: base.r, g: base.g, b: base.b })
    const hex = ref(rgbToHex(base.r, base.g, base.b))
    const svRef = ref<HTMLElement | null>(null)
    const hueRef = ref<HTMLElement | null>(null)
    const draggingSV = ref(false)
    const draggingHue = ref(false)

    const emitColor = () => {
      const c = hsvToRgb(hsv.value.h, hsv.value.s, hsv.value.v)
      rgb.value = c
      hex.value = rgbToHex(c.r, c.g, c.b)
      emit('update:modelValue', toRgba(c.r, c.g, c.b, alpha.value))
    }

    watch(() => props.modelValue, (val) => {
      const p = parseColor(val)
      hsv.value = rgbToHsv(p.r, p.g, p.b)
      alpha.value = p.a
      rgb.value = { r: p.r, g: p.g, b: p.b }
      hex.value = rgbToHex(p.r, p.g, p.b)
    })

    const onSVDown = (e: MouseEvent) => {
      draggingSV.value = true
      const rect = svRef.value!.getBoundingClientRect()
      const update = (x: number, y: number) => {
        const s = clamp((x - rect.left) / rect.width, 0, 1)
        const v = clamp(1 - (y - rect.top) / rect.height, 0, 1)
        hsv.value = { h: hsv.value.h, s, v }
        emitColor()
      }
      update(e.clientX, e.clientY)
      const move = (ev: MouseEvent) => update(ev.clientX, ev.clientY)
      const up = () => { draggingSV.value = false; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    }

    const onHueDown = (e: MouseEvent) => {
      draggingHue.value = true
      const rect = hueRef.value!.getBoundingClientRect()
      const update = (y: number) => {
        const h = clamp(((y - rect.top) / rect.height) * 360, 0, 360)
        hsv.value = { h, s: hsv.value.s, v: hsv.value.v }
        emitColor()
      }
      update(e.clientY)
      const move = (ev: MouseEvent) => update(ev.clientY)
      const up = () => { draggingHue.value = false; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    }

    const onHexChange = (val: string) => {
      const rgbVal = hexToRgb(val || '#000000')
      hsv.value = rgbToHsv(rgbVal.r, rgbVal.g, rgbVal.b)
      emitColor()
    }

    const onRGBChange = (key: 'r' | 'g' | 'b', val: number) => {
      const next = { ...rgb.value, [key]: clamp(val, 0, 255) }
      rgb.value = next
      hsv.value = rgbToHsv(next.r, next.g, next.b)
      emitColor()
    }

    const svBg = () => {
      const c = hsvToRgb(hsv.value.h, 1, 1)
      return `linear-gradient(to top, black, transparent), linear-gradient(to right, white, ${rgbToHex(c.r, c.g, c.b)})`
    }
    const svPointerStyle = () => ({ left: `${hsv.value.s * 100}%`, top: `${(1 - hsv.value.v) * 100}%` })
    const huePointerStyle = () => ({ top: `${(hsv.value.h / 360) * 100}%` })

    const open = ref(false)
    const rootRef = ref<HTMLElement | null>(null)
    const triggerEl = ref<HTMLElement | null>(null)
    const popoverRef = ref<HTMLElement | null>(null)
    const panelLeft = ref(0)
    const panelTop = ref(0)
    const closeOnOutside = (e: MouseEvent) => {
      const el = rootRef.value
      const pop = popoverRef.value
      if (!el) return
      const target = e.target as Node
      const path = (e as any).composedPath?.() || []
      const inTrigger = el.contains(target)
      const inPopover = pop ? pop.contains(target) : false
      const pathHit = path.includes(el) || (pop ? path.includes(pop) : false)
      const inside = inTrigger || inPopover || pathHit
      if (!inside && open.value) open.value = false
    }
    onMounted(() => { document.addEventListener('mousedown', closeOnOutside) })
    onBeforeUnmount(() => { document.removeEventListener('mousedown', closeOnOutside) })

    const panel = () => (
      <div class={`${PREFIX_CLS}-color-picker` + (props.compact ? ' is-compact' : '')}>
        <div class="cp-head">
          {props.presets.map((c: string) => (
            <div class="preset" style={{ background: c }} onClick={() => { const r = hexToRgb(c); hsv.value = rgbToHsv(r.r, r.g, r.b); alpha.value = 1; emitColor() }} />
          ))}
        </div>
        <div class="cp-main">
          <div class="sv" ref={(el) => (svRef.value = el as HTMLElement)} style={{ background: svBg() }} onMousedown={onSVDown}>
            <div class="sv-pointer" style={svPointerStyle()} />
          </div>
          <div class="hue" ref={(el) => (hueRef.value = el as HTMLElement)} onMousedown={onHueDown}>
            <div class="hue-track" />
            <div class="hue-pointer" style={huePointerStyle()} />
          </div>
        </div>
        <div class="cp-ctrl">
          <div class="hex-row">
            <span class="lbl">Hex</span>
            <InputNumber stringMode value={hex.value} onUpdate:value={(v: any) => onHexChange(String(v))} />
            <div class="preview" style={{ background: toRgba(rgb.value.r, rgb.value.g, rgb.value.b, alpha.value) }} />
          </div>
          <div class="rgba-row">
            <div class="row">
              <span class="lbl">R</span>
              <InputNumber min={0} max={255} value={rgb.value.r} onUpdate:value={(v: any) => onRGBChange('r', Number(v) || 0)} />
              <Slider min={0} max={255} value={rgb.value.r} onChange={(v: any) => onRGBChange('r', Number(v) || 0)} />
            </div>
            <div class="row">
              <span class="lbl">G</span>
              <InputNumber min={0} max={255} value={rgb.value.g} onUpdate:value={(v: any) => onRGBChange('g', Number(v) || 0)} />
              <Slider min={0} max={255} value={rgb.value.g} onChange={(v: any) => onRGBChange('g', Number(v) || 0)} />
            </div>
            <div class="row">
              <span class="lbl">B</span>
              <InputNumber min={0} max={255} value={rgb.value.b} onUpdate:value={(v: any) => onRGBChange('b', Number(v) || 0)} />
              <Slider min={0} max={255} value={rgb.value.b} onChange={(v: any) => onRGBChange('b', Number(v) || 0)} />
            </div>
            {props.showAlpha && (
              <div class="row">
                <span class="lbl">A</span>
                <InputNumber min={0} max={1} step={0.01} value={alpha.value} onUpdate:value={(v: any) => { alpha.value = clamp(Number(v) || 0, 0, 1); emitColor() }} />
                <Slider min={0} max={1} step={0.01} value={alpha.value} onChange={(v: any) => { alpha.value = clamp(Number(v) || 0, 0, 1); emitColor() }} />
              </div>
            )}
          </div>
        </div>
      </div>
    )

    return () => {
      if (props.inline) return panel()
      return (
        <div class={`${PREFIX_CLS}-color-picker-trigger`} ref={(el) => (rootRef.value = el as HTMLElement)}>
          <button 
            type="button"
            class="trigger" 
            ref={(el) => (triggerEl.value = el as HTMLElement)}
            style={{ background: toRgba(rgb.value.r, rgb.value.g, rgb.value.b, alpha.value) }} 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (triggerEl.value) {
                const rect = triggerEl.value.getBoundingClientRect()
                panelLeft.value = rect.left
                panelTop.value = rect.bottom + 6
              }
              open.value = true
            }}
            onMousedown={() => {}}
          />
          {open.value && (
            <Teleport to="body">
              <div class={`${PREFIX_CLS}-color-picker-popover`} ref={(el) => (popoverRef.value = el as HTMLElement)} style={{ left: `${panelLeft.value}px`, top: `${panelTop.value}px` }}>{panel()}</div>
            </Teleport>
          )}
        </div>
      )
    }
  }
})
