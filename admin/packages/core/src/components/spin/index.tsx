import './style.scss'
// @ts-ignore
export default (props, { attrs }) => {
  return (
    <div class="c_spin" {...attrs}>
      <div class="c_wave">
        <div class="c_wave__dot"></div>
      </div>
    </div>
  )
}
