import LayerImage from 'ol/layer/image'
import LayerVector from 'ol/layer/vector'
import SourceVector from 'ol/source/vector'

import * as Styles from './olstyle'

export const ImageLayer = new LayerImage

export const PointsLayer = new LayerVector({ source: new SourceVector })

export const PointClickedLayer = new LayerVector({ source: new SourceVector })

export const AxisLayer = new LayerVector({ source: new SourceVector })

PointsLayer.setStyle(Styles.styleTextFunction)

AxisLayer.setStyle((feature, resolution) => {
  if(feature.getProperties().axis == 'x') {
    return Styles.xAxisStyle
  }
  return Styles.yAxisStyle
})