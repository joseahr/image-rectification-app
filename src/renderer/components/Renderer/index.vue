<template>
  <div ref="renderer" class="renderer"></div>
</template>

<script>
import Renderer from 'ol/map'

import Feature from 'ol/feature'
import PointGeom from 'ol/geom/point'
import LineString from 'ol/geom/linestring'
import OLObservable from 'ol/observable'
import DragZoom from 'ol/interaction/dragzoom'
import Modify from 'ol/interaction/modify'
import SelectInteraction from 'ol/interaction/select'
import condition from 'ol/events/condition'
import Graticule from 'ol/graticule'
import Stroke from 'ol/style/stroke'

import * as ImageUtil from './utils/image'
import * as Styles from './utils/olstyle'

import {
  ImageLayer,
  PointsLayer,
  PointClickedLayer,
  AxisLayer
} from './utils/layers'

export default {
  data () {
    return {
      renderer: null,
      w: 0,
      h: 0,
      clickHandler: null,
      modify: null,
      selectModify: null,
      select: null,
      selectPointerMove: null,
      listenerAxis: null
    }
  },

  created() {
    this.$electron.ipcRenderer.on('win-add-point-closed', () => {
      PointClickedLayer.getSource().clear()
    })
  },

  mounted() {
    this.renderer = new Renderer({
      target: this.$refs.renderer,
      layers: [ImageLayer, PointsLayer, PointClickedLayer]
    })

    AxisLayer.setMap(this.renderer)

    for(const interaction of this.renderer.getInteractions().getArray()) {
      if(interaction instanceof DragZoom)
      this.renderer.removeInteraction(interaction)
    }

    this.$watch(() => this.$store.getters.actualImage, this.processFile)

    // Resize
    window.addEventListener('resize', this.onResize)
    this.$watch(() => this.$store.getters.mainMenuOpened, this.onResize)
    this.$watch(() => this.$store.getters.miniMenu, this.onResize)

    this.$watch(() => this.$store.getters.controlPoints, this.onControlPointsChanged)

    this.$watch(() => this.$store.getters.capturingControlPoints, this.onCapturingControlPoints)

  },

  methods: {

    drawAxis() {
      function draw(){
        AxisLayer.getSource().clear()
        const extent = this.renderer.getView().calculateExtent()
        const [xmin, ymin, xmax, ymax] = extent
        // Eje X
        const axisX = new LineString([ [xmin, this.h / 2], [xmax, this.h / 2] ])
        const axisY = new LineString([ [this.w / 2, ymin], [this.w / 2, ymax] ])
  
        const featureX = new Feature({ geometry: axisX, axis: 'x' })
        const featureY = new Feature({ geometry: axisY, axis: 'y' })
  
        AxisLayer.getSource().addFeatures([featureX, featureY])
      }

      this.listenerAxis = this.renderer.getView().on('change', draw.bind(this))
      draw.call(this)

    },

    removeAxis() {
      AxisLayer.getSource().clear()
      OLObservable.unByKey(this.listenerAxis)
      this.listenerAxis = null
    },

    onResize() {
      console.log('resize')
      let i = 60;
      const resize = () => {
        if(i--) {
          this.renderer.updateSize()
          window.requestAnimationFrame(resize)
        }
      }
      resize()
    },
    async processFile(path) {

      ImageLayer.setSource()
      PointsLayer.getSource().clear()
      PointClickedLayer.getSource().clear()
      this.removeAxis()

      if(!path) {
        return 
      }


      const [w, h] = await ImageUtil.readImage(path)
      console.log(w, h)
      this.w = w
      this.h = h

      const source = ImageUtil.getImageStatic(path, w, h)
      const view = ImageUtil.getViewForImage(w, h)

      // this.renderer.getLayers().getArray().forEach(l => this.renderer.removeLayer(l))

      ImageLayer.setSource(source)
      this.renderer.setView(view)
      this.onControlPointsChanged(this.$store.getters.controlPoints)
      this.drawAxis()
      // this.renderer.addLayer(layer)
      // this.renderer.addLayer(this.controlPointsLayer)
    },

    getClickHandler({coordinate: [x, y]}) {

      PointClickedLayer.getSource().clear()

      const [nX, nY] = [x - (this.w / 2), y - (this.h / 2)]
      console.log(nX, nY)
      this.$electron.ipcRenderer.send('open-add-point-dialog', [x, y - this.h])

      const feature = new Feature({ geometry: new PointGeom([x, y]) })

      PointClickedLayer.getSource().addFeature(feature)
    },

    onControlPointsChanged(controlPoints) {
      console.log(controlPoints, 'CPPP')
      PointsLayer.getSource().clear()

      const cp = controlPoints[this.$store.getters.actualImage]

      if(!cp) {
        return
      }
      

      const features = cp.map(([p2d, p3d], idx)=> {
        const [xm, ym] = p2d
        const [x, y] = [xm + (this.w/2), ym + (this.h/2)]

        return new Feature({
          geometry: new PointGeom([xm, ym + this.h]),
          index: idx
        })
      })

      PointsLayer.getSource().addFeatures(features)

    },

    onCapturingControlPoints(capturing) {

      console.log('Capturing Control Poiont', capturing)

      if(this.clickHandler) {
        OLObservable.unByKey(this.clickHandler)
        this.clickHandler = null
      }

      if(capturing) {
        this.clickHandler = this.renderer.on('click', this.getClickHandler.bind(this))
        this.disableModifyInteraction()
        this.disableSelectControlPoints()
      } else {
        this.createSelectInteraction()
        this.createModifyIteraction()
      }

    },

    createModifyIteraction() {

      this.selectModify = new SelectInteraction({
        condition: condition.singleClick,
        layers: [PointsLayer],
        style: Styles.highlightStyle
      })

      this.modify = new Modify({
        deleteCondition: undefined,
        features: this.selectModify.getFeatures()
      })

      this.selectModify.on('select', (event) => {
        if(event.selected.length) {
          this.$store.dispatch('setUpdateControlPointImageCoords', true)
        } else if(event.deselected.length) {
          this.$store.dispatch('setUpdateControlPointImageCoords', false)
        }
      })

      this.modify.on('modifyend', (event, f) => {

        this.$store.dispatch('setUpdateControlPointImageCoords', false)

        const {features} = event
        
        const [feature] = features.getArray()

        if(feature) {
          console.log(feature)

          const [x, y] = feature.getGeometry().getCoordinates()
          const coordsImage = [x, y - this.h]

          // const coordsImage = [x - (this.w / 2), y - (this.h / 2)]

          const { index } = feature.getProperties()

          this.$store.dispatch('updateControlPoint', { index, coordsImage })

          this.selectModify.getFeatures().clear()
        }
      })

      this.renderer.addInteraction(this.selectModify)
      this.renderer.addInteraction(this.modify)
    },

    createSelectInteraction() {
      this.select = this.renderer.on('dblclick', (event) => {

        const selectHasFeatures = !!this.selectModify.getFeatures().getArray().length

        if(selectHasFeatures) {
          return event.stopPropagation()
        }

        const { pixel } = event

        const feature = this.renderer.forEachFeatureAtPixel(pixel, feature => feature)

        if(feature) {
          // console.log(feature, 'selected', feature.getProperties())
          const { index } = feature.getProperties()
          // const [x, y] = feature.getGeometry().getCoordinates()
          // const [nX, nY] = [x - (this.w / 2), y - (this.h / 2)]
          // console.log(nX, nY)
          const point = this.$store.getters.controlPoints[this.$store.getters.actualImage][index]

          console.log(point, index, 'WWW')
          
          const [coordsImage, coordsObject] = point
          console.log(coordsImage, coordsObject, index, point)
          this.$electron.ipcRenderer.send('open-update-point-dialog', {index, coordsImage, coordsObject})

          event.stopPropagation()
        }

      })

      this.selectPointerMove = this.renderer.on('pointermove', ({pixel}) => {
        const feature = this.renderer.forEachFeatureAtPixel(pixel, (feature) => feature)

        if(feature) {
          document.body.style.cursor = 'pointer'
        } else {
          document.body.style.cursor = 'auto'
        }
      })

    },

    disableModifyInteraction() {
      this.renderer.removeInteraction(this.selectModify)
      this.renderer.removeInteraction(this.modify)
      this.$store.dispatch('setUpdateControlPointImageCoords', false)
      this.modify = null
      this.selectModify = null
    },

    disableSelectControlPoints() {
      OLObservable.unByKey(this.select)
      OLObservable.unByKey(this.selectPointerMove)
      this.select = null
      this.selectPointerMove = null
    }

  }
}
</script>

<style scoped>
.renderer {
  background-color: #888;
  width: 100%;
  height: 100%;
}
</style>
