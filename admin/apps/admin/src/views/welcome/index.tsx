import { defineComponent } from 'vue' 
import { CardLink } from '@/components'
import type { RouteMeta } from '@/router/routeMeta'
import './style.scss'

export default defineComponent({
  name: 'Welcome',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    const links = [
      {
        url: '/resume/home',
        title: '简历制作',
        description: '创建专业的个人简历',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20resume%20creation%20dashboard&image_size=square',
        useRouter: true,
        target: '_blank'
      }
    ]

    return () => {
      return (
        <div class="welcome-page">
          <CardLink links={links} />
        </div>
      )
    }
  }
})

export const routeMeta: RouteMeta = {
  title: '欢迎页',
  // 设置排序，越小越靠前
  order: 1 ,
  // 留空字符串表示自动跳转到本目录排序最靠前的子路由
  redirect: '',
  // 是否隐藏侧边菜单
  hideInMenu: false,
  icon: 'more2'
}
