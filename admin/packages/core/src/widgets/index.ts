import JSF from '@anteng/jsf'

export { default as ActionWidget } from './action'

import mediaAlbum from './media-album'

try {
  JSF.registerWidget({ 'media-album': mediaAlbum })
} catch (err) {
  err
}
