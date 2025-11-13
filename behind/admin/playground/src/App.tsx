import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import RouteSidebar from './components/RouteSidebar'
import './assets/route-sidebar.css'

export default defineComponent({
  name: 'App',
  setup() {
    return () => (
      <div class="app-layout">
        <RouteSidebar />
        <main class="app-main">
          <RouterView />
        </main>
      </div>
    )
  },
})
