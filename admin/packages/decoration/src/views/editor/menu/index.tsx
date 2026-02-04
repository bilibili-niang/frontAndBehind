import { defineComponent } from 'vue'
import { Tooltip, message } from '@pkg/ui'
import { openSettings } from '@pkg/core'
import './style.scss'

import Comps from './comps'
import Layers from './layers'

export default defineComponent({
  name: 'DeckEditorMenu',
  setup() {
    const tooltipPlacament = 'right'
    return () => {
      return (
        <>
          <div class="deck-editor-menu">
            <div class="deck-editor-menu__list"></div>
            <Tooltip title="设置" placement={tooltipPlacament}>
              <div class="basic-layout__icon-button clickable" onClick={() => openSettings()}>
                <iconpark-icon name="settings"></iconpark-icon>
              </div>
            </Tooltip>
          </div>
          <div class="deck-editor-menu-panel">
            <>
              <Layers />
              <Comps />
            </>
          </div>
        </>
      )
    }
  }
})
