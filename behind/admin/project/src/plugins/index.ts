import { createVuetify } from 'vuetify'
import 'vuetify/styles' //vuetify全局样式文件
import colors from 'vuetify/lib/util/colors'

console.log('colors')
console.log(colors)
const vuetify = createVuetify({
  styles: {
    configFile: 'src/styles/settings.scss',
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#121212',
          surface: '#1E1E1E',
          primary: '#00bcd4',
          secondary: '#03dac6',
          error: '#cf6679',
        },
      },
      light: {
        dark: false,
        colors: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          primary: '#00bcd4',
          secondary: '#03dac6',
          error: '#b00020',
        },
      },
    },
  },
})
export default vuetify