import { EdgeDirection, PositionStyles } from './types'

/**
 * 获取方向对应的位置样式
 */
export const getPositionStyles = (direction: EdgeDirection): PositionStyles => {
  const baseContainer = 'fixed z-50 transition-all duration-300 ease-in-out'
  
  switch (direction) {
    case 'top':
      return {
        container: `${baseContainer} top-0 left-1/2 -translate-x-1/2`,
        content: 'w-[99vw] h-auto max-h-[80vh] overflow-auto',
        transform: {
          hidden: '-translate-y-full opacity-0',
          visible: 'translate-y-0 opacity-100'
        }
      }
    
    case 'bottom':
      return {
        container: `${baseContainer} bottom-0 left-1/2 -translate-x-1/2`,
        content: 'w-[99vw] h-auto max-h-[80vh] overflow-auto',
        transform: {
          hidden: 'translate-y-full opacity-0',
          visible: 'translate-y-0 opacity-100'
        }
      }
    
    case 'left':
      return {
        container: `${baseContainer} left-0 top-1/2 -translate-y-1/2`,
        content: 'h-[99vh] w-auto max-w-[80vw] overflow-auto',
        transform: {
          hidden: '-translate-x-full opacity-0',
          visible: 'translate-x-0 opacity-100'
        }
      }
    
    case 'right':
      return {
        container: `${baseContainer} right-0 top-1/2 -translate-y-1/2`,
        content: 'h-[99vh] w-auto max-w-[80vw] overflow-auto',
        transform: {
          hidden: 'translate-x-full opacity-0',
          visible: 'translate-x-0 opacity-100'
        }
      }
    
    default:
      return getPositionStyles('top')
  }
}

/**
 * 获取主题样式
 */
export const getThemeStyles = (theme: 'light' | 'dark' | 'glass' = 'light'): string => {
  switch (theme) {
    case 'light':
      return 'bg-white border border-gray-200'
    
    case 'dark':
      return 'bg-gray-900 border border-gray-700 text-white'
    
    case 'glass':
      return 'bg-white/80 backdrop-blur-md border border-white/20'
    
    default:
      return getThemeStyles('light')
  }
}

/**
 * 获取圆角样式
 */
export const getRoundedStyles = (rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'): string => {
  const roundedMap = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  }
  
  return roundedMap[rounded]
}

/**
 * 获取阴影样式
 */
export const getShadowStyles = (shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'lg'): string => {
  const shadowMap = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  return shadowMap[shadow]
}

/**
 * 检测鼠标是否在屏幕边缘
 */
export const isMouseAtEdge = (
  direction: EdgeDirection,
  clientX: number,
  clientY: number,
  threshold: number
): boolean => {
  const { innerWidth, innerHeight } = window

  switch (direction) {
    case 'top':
      return clientY <= threshold
    case 'bottom':
      return clientY >= innerHeight - threshold
    case 'left':
      return clientX <= threshold
    case 'right':
      return clientX >= innerWidth - threshold
    default:
      return false
  }
}

/**
 * 组合所有样式类名
 */
export const combineStyles = (...styles: (string | undefined)[]): string => {
  return styles.filter(Boolean).join(' ')
}