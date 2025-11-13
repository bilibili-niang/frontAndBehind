import { defineComponent } from 'vue'

export default defineComponent({
  name: '',
  props: {
    // 是否显示返回按钮
    backIcon:{
      type: Boolean,
      default: true
    },
    // 是否显示快捷菜单（三横）
    menuIcon:{
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    return () => {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 87 32"
          fill="none"
        >
          <g opacity="1" transform="translate(0 0)  rotate(0)">
            {props.menuIcon && (
              <g opacity="1" transform="translate(56.400390625 9.5)  rotate(0)">
                <path
                  id="路径 1"
                  fill-rule="evenodd"
                  style="fill:currentColor"
                  opacity="1"
                  d="M1.2 11.0996C0.5 11.0996 0 11.5996 0 12.2996C0 12.9996 0.5 13.4996 1.2 13.4996L15.8 13.4996C16.4 13.4996 17 13.0996 17 12.2996C17 11.4996 16.5 11.0996 15.8 11.0996L1.2 11.0996Z"
                ></path>
                <path
                  id="路径 2"
                  fill-rule="evenodd"
                  style="fill:currentColor"
                  opacity="1"
                  d="M15.8 2.4C16.4 2.4 17 2 17 1.2C17 0.5 16.5 0 15.8 0L1.2 0C0.5 0 0 0.6 0 1.2C0 1.8 0.5 2.4 1.2 2.4L15.8 2.4Z"
                ></path>
                <path
                  id="路径 3"
                  fill-rule="evenodd"
                  style="fill:currentColor"
                  opacity="1"
                  d="M1.2 5.59961C0.5 5.59961 0 6.09961 0 6.79961C0 7.49961 0.5 7.99961 1.2 7.99961L15.8 7.99961C16.4 7.99961 17 7.59961 17 6.79961C17 6.09961 16.5 5.59961 15.8 5.59961L1.2 5.59961Z"
                ></path>
              </g>
            )}
            {props.backIcon && (
              <path
                id="路径 4"
                fill-rule="evenodd"
                style="fill:currentColor"
                opacity="1"
                d="M26.0996 9.99961C26.2996 9.79961 26.3996 9.49961 26.3996 9.19961C26.3996 8.89961 26.2996 8.59961 26.0996 8.39961C25.6996 7.99961 24.8996 7.99961 24.4996 8.39961L17.8996 14.9996C17.6996 15.1996 17.5996 15.4996 17.5996 15.7996C17.5996 16.0996 17.6996 16.3996 17.8996 16.5996L24.4996 23.1996C24.6996 23.3996 24.9996 23.4996 25.2996 23.4996C25.5996 23.4996 25.8996 23.3996 26.0996 23.1996C26.4996 22.7996 26.4996 21.9996 26.0996 21.5996L20.2996 15.7996L26.0996 9.99961Z"
              ></path>
            )}
            {props.backIcon && props.menuIcon && (
              <path
                id="Rectangle_3"
                fill-rule="evenodd"
                style="fill:currentColor"
                opacity="0.2"
                d="M41.5,24.6998v-17.9h0.5v17.9z"
              ></path>
            )}
          </g>
        </svg>
      )
    }
  }
})
