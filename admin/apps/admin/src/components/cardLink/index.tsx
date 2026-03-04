import { defineComponent, PropType } from 'vue'
import { useRouter } from 'vue-router'
import './style.scss'

interface CardLinkItem {
  url: string
  title: string
  description?: string
  image?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  useRouter?: boolean
}

export default defineComponent({
  name: 'CardLink',
  props: {
    links: {
      type: Array as PropType<CardLinkItem[]>,
      required: true
    },
    className: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const router = useRouter()

    const handleClick = (link: CardLinkItem) => {
      if (link.useRouter) {
        if (link.target === '_blank') {
          const routeData = router.resolve({ path: link.url })
          window.open(routeData.href, '_blank')
        } else {
          router.push(link.url)
        }
      }
    }

    return () => {
      return (
        <div class={`card-link-container ${props.className}`}>
          {props.links.map((link, index) => (
            link.useRouter ? (
              <div 
                key={index} 
                onClick={() => handleClick(link)}
                class="card-link-item cursor-pointer"
              >
                {link.image && (
                  <div class="card-link-image">
                    <img src={link.image} alt={link.title} />
                  </div>
                )}
                <div class="card-link-content">
                  <h3 class="card-link-title">{link.title}</h3>
                  {link.description && (
                    <p class="card-link-description">{link.description}</p>
                  )}
                </div>
              </div>
            ) : (
              <a 
                key={index} 
                href={link.url} 
                target={link.target || '_blank'}
                rel="noopener noreferrer"
                class="card-link-item"
              >
                {link.image && (
                  <div class="card-link-image">
                    <img src={link.image} alt={link.title} />
                  </div>
                )}
                <div class="card-link-content">
                  <h3 class="card-link-title">{link.title}</h3>
                  {link.description && (
                    <p class="card-link-description">{link.description}</p>
                  )}
                </div>
              </a>
            )
          ))}
        </div>
      )
    }
  }
})