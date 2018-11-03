import View from 'ol/view'
import ImageStatic from 'ol/source/imagestatic'
import Projection from 'ol/proj/projection'

export function readImage(localPath) {
  const img = document.createElement('img')
  return new Promise((res, rej) => {
    img.src = localPath
    img.addEventListener('load', (event) => {
      const { naturalWidth, naturalHeight } = img
      console.log('img', naturalWidth, naturalHeight)
      res([naturalWidth, naturalHeight])
    })
  })
}

export function getViewForImage(w, h) {
  return new View({
    center: [w / 2, h / 2],
    zoom: 2,
    projection: new Projection({
      extent: [0, 0, w, h],
      units: 'pixels'
    }),
    extent: [0, 0, w, h]
  })
}

export function getImageStatic(path, w, h) {
  return new ImageStatic({
    url: path,
    imageExtent: [0, 0, w, h]
  })
}