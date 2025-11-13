import { defineComponent } from 'vue'
import './style.scss'
import Header from './header'
import Menu from './menu'
import Render from './canvas'
import Configure from './configure'

export default defineComponent({
  name: 'DeckEditor',

  setup(props) {
    const onContextmenu = (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
    }

    return () => (
      <div class="deck-editor">
        <Header />
        <main class="deck-editor__main">
          <Menu />
          <div class="deck-editor__render">
            <Render />
          </div>
          <Configure />
        </main>
      </div>
    )
  }
})
