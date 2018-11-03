import Style from 'ol/style/style'
import Stroke from 'ol/style/stroke'
import Fill from 'ol/style/fill'
import Circle from 'ol/style/circle'
import Text from 'ol/style/text'
import RegularShape from 'ol/style/regularshape'

const fill = new Fill({
  color: 'yellow',
  opacity: 0.5
})

const stroke = new Stroke({
  color: 'yellow',
  width: 1.25
})

export const highlightStyle = new Style({
  image: new Circle({ fill, stroke, radius: 5 })
})

const styleText = new Style({
  image: new RegularShape({
    points: 3,
    radius: 10,
    fill
  }),
  text: new Text({
    offsetY: -10,
    font: 'bold 25px "Arial Unicode MS", "sans-serif"',
    fill: new Fill({ color: 'white' })
  })
})

export function styleTextFunction(feature) {
  const {index} = feature.getProperties()
  styleText.getText().setText(`${index}`)
  return styleText
}

export const xAxisStyle = new Style({
  stroke: new Stroke({
    color: 'red',
    width: 2
  })
})

export const yAxisStyle = new Style({
  stroke: new Stroke({
    color: 'green',
    width: 2
  })
})