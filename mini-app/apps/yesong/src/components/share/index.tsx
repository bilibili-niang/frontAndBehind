import './style.scss'
import { Button } from '@tarojs/components'
import { navigateToPoster } from '../../router'
import { usePopup } from '@anteng/core'
import { Icon } from '@anteng/ui'

/**
 *  分享菜单
 *  handler: 分享菜单点击事件,目前只有分享海报用得上 不传入/传入为null时不展示 分享海报 按钮
 */
export const useShareMenu = (config: { type: 'building' | 'room'; id: string | number; handler: Function }) => {
  const { type, id, handler } = config

  const popup = usePopup({
    placement: 'bottom',
    content: (
      <div class="rent-share-menu">
        <div class="rent-share-menu__content">
          <div
            class="rent-share-menu__item"
            onClick={() => {
              popup.close()
            }}
          >
            <div class="rent-share-menu__icon message">
              <Icon name="goutong_communication" class="share-icon" />
            </div>
            <div class="rent-share-menu__text">分享到聊天</div>
            <Button class="share-button" openType="share"></Button>
          </div>
          {handler && (
            <div
              class="rent-share-menu__item"
              onClick={() => {
                handler()
                popup.close()
              }}
            >
              <div class="rent-share-menu__icon message">
                <Icon name="qiehuan_app-switch" class="share-icon" />
              </div>
              <div class="rent-share-menu__text">分享海报</div>
            </div>
          )}
          <div
            class="rent-share-menu__item"
            onClick={() => {
              popup.close()
              navigateToPoster(id, type)
            }}
          >
            <div class="rent-share-menu__icon poster">
              <Icon name="xintupian_new-picture" class="share-icon" />
            </div>
            <div class="rent-share-menu__text">生成长海报</div>
          </div>
        </div>
        <div
          class="rent-share-menu__cancel"
          onClick={() => {
            popup.close()
          }}
        >
          取消
        </div>
      </div>
    )
  })
}
